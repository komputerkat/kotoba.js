import '@babel/polyfill';
import $ from 'jquery';
import 'jquery-serializejson';

import { initExpandVideo, initExpandImage } from './modules/attachment-viewer';
import { initHidePost } from './modules/hide-post';
import { initExpandThread } from './modules/expand-thread';
import { initAdminPanel } from './modules/admin-panel';
import { localizeTime } from './modules/time';
import { init as initManage } from './modules/manage';
import { init as initForms } from './modules/form';
import { initTabs } from './modules/tabs';
import { initToggleVisibility } from './modules/toggle-visibility';

$(() => {
  initExpandImage();
  initExpandVideo();
  initHidePost();
  initExpandThread();
  initAdminPanel();
  localizeTime();
  initManage();
  initForms();
  initTabs();
  initToggleVisibility();
});
