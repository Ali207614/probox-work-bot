import type { ActionTree, ButtonAction } from '../types/bot.types';
import { adminHandlers, stepHandlers } from './button.handler';
import { textHandlers } from './text.handler';

export const handlerRegistry: ActionTree = {
  ...textHandlers,
  ...stepHandlers,
  ...adminHandlers,
};

const dynamicBranches: ActionTree = {};

export const findHandler = (msgText: string): ButtonAction | undefined => {
  return handlerRegistry[msgText] ?? dynamicBranches[msgText];
};
