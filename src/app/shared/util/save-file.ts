import { isTauri } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';

export interface SaveFileFilter {
  name: string;
  extensions: string[];
}

export async function saveTextFile(
  defaultName: string,
  mimeType: string,
  contents: string,
  filter: SaveFileFilter,
): Promise<boolean> {
  if (!isTauri()) {
    const anchor = document.createElement('a');
    anchor.download = defaultName;
    anchor.href = `data:${mimeType};charset=utf-8,` + encodeURIComponent(contents);
    anchor.click();
    return true;
  }

  const path = await save({
    defaultPath: defaultName,
    filters: [filter],
  });

  if (!path) {
    return false;
  }

  await writeTextFile(path, contents);
  return true;
}
