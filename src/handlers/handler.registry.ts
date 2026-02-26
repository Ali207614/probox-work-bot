import type { ActionTree, ButtonAction } from '../types/bot.types';
import { textHandlers } from './text.handler';

export const handlerRegistry: ActionTree = {
  ...textHandlers,
};

const dynamicBranches: ActionTree = {};

export const findHandler = (msgText: string): ButtonAction | undefined => {
  return handlerRegistry[msgText] ?? dynamicBranches[msgText];
};
