import { createAvatar } from '@dicebear/core';
import { notionists } from '@dicebear/collection';

const avatar = createAvatar(notionists, {
  seed: 'notionists',
  radius: 20,

}).toDataUriSync();

export const useCreateAvatar = () => {
  return avatar;
}
