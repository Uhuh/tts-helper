import { DestroyRef, inject, Injectable } from '@angular/core';
import { ChatCommand, ChoiceCommand, Commands, CounterCommand, SoundCommand } from './command.interface';
import { LogService } from './logs.service';
import { UserPermissions } from './chat.interface';
import { VStreamService } from './vstream.service';
import { concat, filter, first, map, of, switchMap, tap, timer } from 'rxjs';
import { ChatService } from './chat.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AudioService } from './audio.service';

@Injectable({
  providedIn: 'root',
})
export class CommandService {
  private readonly vstreamService = inject(VStreamService);
  private readonly chatService = inject(ChatService);
  private readonly logService = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly audioService = inject(AudioService);

  private readonly commands$ = this.vstreamService.commands$;

  readonly cooldowns = new Map<string, {
    duration: number,
    onCooldown: boolean,
    timeout?: NodeJS.Timeout,
  }>();

  readonly autoredeems = new Map<string, {
    interval: number,
    timer: NodeJS.Timer,
  }>();

  constructor() {
    this.commands$
      .pipe(
        takeUntilDestroyed(),
        tap(commands => {
          const commandIDs = commands.map(c => c.id);
          const chatCommands = commands.filter((c): c is ChatCommand => c.type === 'chat');
          this.clearOldAutoIntervals(commandIDs);
          this.resetAutoIntervals(chatCommands);
          this.updateCooldowns(commands);
        }),
      ).subscribe();
  }

  /**
   * If a user has updated the cooldowns of an existing command, we want to remove any active cooldowns.
   * @param commands All the VStream chat commands
   * @private
   */
  private updateCooldowns(commands: Commands[]) {
    for (const command of commands) {
      const cooldown = this.cooldowns.get(command.id);

      if (!cooldown) {
        continue;
      }

      const { duration, timeout } = cooldown;
      const newDuration = command.cooldown * 1000;

      if (duration === newDuration) {
        continue;
      }

      clearTimeout(timeout);
      this.cooldowns.delete(command.id);
    }
  }

  private resetAutoIntervals(commands: ChatCommand[]) {
    /**
     * I want to be safe and have the lowest interval be 1 minute.
     */
    const LOWEST_INTERVAL = 60 * 1000;

    for (const command of commands) {
      const interval = command.autoRedeemInterval * LOWEST_INTERVAL;
      const isIntervalValid = interval >= LOWEST_INTERVAL;
      const autoRedeem = this.autoredeems.get(command.id);

      if (command.autoRedeem && !autoRedeem && isIntervalValid) {
        this.autoredeems.set(
          command.id,
          {
            interval,
            timer: setInterval(() => this.handleAutoRedeem(command.id), interval),
          },
        );
      } else if (command.autoRedeem && autoRedeem && autoRedeem.interval !== interval && isIntervalValid) {
        clearInterval(autoRedeem.timer);

        this.autoredeems.set(
          command.id,
          {
            interval,
            timer: setInterval(() => this.handleAutoRedeem(command.id), interval),
          },
        );
      } else if ((!command.autoRedeem || !isIntervalValid) && autoRedeem) {
        clearInterval(autoRedeem.timer);
        this.autoredeems.delete(command.id);
      }
    }
  }

  private clearOldAutoIntervals(commandIDs: string[]) {
    const autoIDs = this.autoredeems.keys();

    /**
     * If a user removes a command that had auto redeem we want to remove it from the timers.
     */
    for (const autoID of autoIDs) {
      const redeemExist = commandIDs.find(id => autoID === id);

      if (redeemExist) {
        continue;
      }

      const redeem = this.autoredeems.get(autoID);
      clearInterval(redeem?.timer);
      this.autoredeems.delete(autoID);
    }
  }

  handleCommand(command: Commands, permissions: UserPermissions, text: string, chainCommand = false) {
    const hasPerms = this.chatService.hasChatCommandPermissions({ permissions }, command.permissions);

    if (!hasPerms || this.cooldowns.get(command.id)?.onCooldown) {
      return;
    }

    switch (command.type) {
      case 'counter':
        this.handleCounterCommand(command);
        break;
      case 'sound':
        this.handleSoundCommand(command);
        break;
      case 'chat':
        this.handleChatCommand(command, text);
        break;
      case 'choice':
        this.handleChoiceCommand(command);
        break;
      default:
        return this.logService.add(
          `Tried handling an unsupported command type.\n${JSON.stringify(command, null, 2)}`,
          'error',
          'CommandService.handleCommand',
        );
    }

    /**
     * If we get here, we can assume we ran a correct command type.
     * Let's handle cooldowns if any exist.
     */
    const duration = command.cooldown * 1000;

    this.cooldowns.set(command.id, {
      duration,
      onCooldown: true,
      timeout: setTimeout(() => this.cooldowns.set(command.id, { duration, onCooldown: false }), duration),
    });

    this.logService.add(`Processing command.\n${JSON.stringify(command, null, 2)}`, 'info', 'CommandService.handleCommand');

    /**
     * If the command isn't a chain command call then it's safe to assume we want to check the commands
     * possible chain commands.
     */
    if (!chainCommand) {
      this.handleCommandChain(command, permissions, text);
    }
  }

  handleCommandChain(command: Commands, permissions: UserPermissions, text: string) {
    const { chainCommands } = command;

    // Obviously, if there are no chain commands we want to ignore this.
    if (!chainCommands.length) {
      return;
    }

    this.commands$
      .pipe(
        first(),
        takeUntilDestroyed(this.destroyRef),
        map(allCommands => chainCommands.map(chain => ({
          command: allCommands.find(c => c.id === chain.chainCommandID),
          chainCommandDelay: chain.chainCommandDelay,
        }))),
        map(commands => commands.filter((c): c is { command: Commands, chainCommandDelay: number } => !!c.command)),
        switchMap(commands => {
          if (!commands.length) {
            return of(null); // Handle empty array case
          }

          /**
           * @TODO - Investigate how to handle this case
           * If the user has multiple counter chain commands that refer to the same command, this will NOT increment the value as expected.
           * This is due to the value of the command being the same here and they all try to increment from the same value, they do NOt
           * update each others value as they themselves update.
           */
          return concat(
            ...commands.map(chainCommand =>
              timer(chainCommand.chainCommandDelay * 1000 + 200).pipe(
                map(() => chainCommand.command),
                tap(command => this.handleCommand(command, permissions, text, true)),
              ),
            ),
          );
        }),
      )
      .subscribe();
  }

  handleChatCommand(command: ChatCommand, text: string) {
    let { response } = command;

    const [_, ...args] = text.split(' ');

    for (const i in args) {
      response = response.replaceAll(`{${i}}`, args[i]);
    }

    this.vstreamService.postChannelMessage(response);
  }

  handleSoundCommand(command: SoundCommand) {
    const { fileURL } = command;

    if (!fileURL) {
      return;
    }

    this.audioService.playSoundFile(fileURL);
  }

  handleChoiceCommand(command: ChoiceCommand) {
    const { options } = command;
    let { response } = command;

    const choice = options[Math.floor(Math.random() * options.length)];

    response = response.replaceAll(`{value}`, choice);

    this.vstreamService.postChannelMessage(response);
  }

  handleCounterCommand(command: CounterCommand) {
    const { amount } = command;
    let { response, value } = command;

    value += amount;

    response = response.replaceAll(`{value}`, `${value}`);

    this.vstreamService.updateCommandSettings({ value, type: command.type }, command.id);

    this.vstreamService.postChannelMessage(response);
  }

  handleAutoRedeem(commandID: string) {
    this.commands$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        first(),
        map(commands => commands.find(c => c.id === commandID)),
        filter((command): command is Commands => !!command),
        tap(command => this.handleCommand(command, { isBroadcaster: true, isMod: false, isPayingMember: false }, '')),
      ).subscribe();
  }
}