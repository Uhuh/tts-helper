import { VStreamEventTypes } from '../../../shared/state/vstream/vstream.feature';
import { VariableTableOption } from '../../../shared/components/variable-table/variable-table.component';

export const VStreamEventVariables: {
  [k in VStreamEventTypes]: {
    header: string,
    example: string,
    result: string,
    variables: VariableTableOption[],
  }
} = {
  uplifting_chat_sent: {
    header: 'Use variables to reference info related to the UpLift',
    example: 'Thanks <span class="var">username</span> for the <span class="var">formatted</span> UpLift!',
    result: 'Thanks Panku for the $10 UpLift!',
    variables: [
      { variable: 'formatted', descriptor: 'The monetary value of the UpLift. (Ex $10)' },
      { variable: 'text', descriptor: 'The text the user included in the UpLift.' },
      { variable: 'username', descriptor: 'The user that sent the UpLift.' },
    ],
  },
  chat_created: { header: '', variables: [], result: '', example: '' },
  keep_alive: { header: '', variables: [], result: '', example: '' },
  livestream_started: { header: '', variables: [], result: '', example: '' },
  new_follower: {
    header: 'Use variables to reference info related to the follow.',
    example: 'Thanks <span class="var">username</span> for following!',
    result: 'Thanks Panku for following!',
    variables: [
      { variable: 'username', descriptor: 'The user that followed.' },
    ],
  },
  shower_received: {
    header: 'Use variables to reference info related to the Meteor Shower.',
    example: 'Thanks <span class="var">username</span> for the <span class="var">size</span> person meteor shower!',
    result: 'Thanks Panku for the 10 person meteor shower!',
    variables: [
      { variable: 'username', descriptor: 'The username of the person that started the meteor shower.' },
      { variable: 'size', descriptor: 'The size of the meteor shower.' },
      { variable: 'title', descriptor: 'The title of the senders stream.' },
      { variable: 'description', descriptor: 'The description of the senders stream.' },
    ],
  },
  subscription_renewed: {
    header: 'Use variables to reference info related to the subscription.',
    example: 'Thanks <span class="var">username</span> for subscribing for <span class="var">renewalMonth</span> months!',
    result: 'Thanks Panku for subscribing for 2 months!',
    variables: [
      { variable: 'streakMonth', descriptor: 'The current subscription streak.' },
      { variable: 'renewalMonth', descriptor: 'The number of months the user has subscribed.' },
      { variable: 'tier', descriptor: 'The tier of the subscription.' },
      { variable: 'text', descriptor: 'The text the user included in the subscription.' },
      { variable: 'username', descriptor: 'The user that subscribed.' },
    ],
  },
  subscriptions_gifted: {
    header: 'Use variables to reference info related to the gift.',
    example: 'Thanks <span class="var">gifter</span> for gifting <span class="var">amount</span> tier <span class="var">tier</span> subs!',
    result: 'Thanks Panku for gifting for 2 tier 2 subs!',
    variables: [
      { variable: 'tier', descriptor: 'The tier of the gift.' },
      { variable: 'amount', descriptor: 'The number of gifts the user gifted.' },
      { variable: 'gifter', descriptor: 'The user that gifted subscriptions.' },
    ],
  },
};