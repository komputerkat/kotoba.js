/**
 * Tabbed components
 * @module modules/tabs
 */
import $ from 'jquery';

export const selectTab = (tabHref) => {
  let allTabsInControlGroup = Array
    .from(document.querySelectorAll(`.js-select-tab[href="${ tabHref }"]`))
    .map(tabBtn => tabBtn.closest('.tab-menu'))
    .map(tabsSelector => Array.from(tabsSelector.querySelectorAll('.js-select-tab')));
  allTabsInControlGroup = [].concat.apply([], allTabsInControlGroup);  // flatten array
  allTabsInControlGroup.forEach((tabBtn) => {
    tabBtn.classList.toggle('active', tabBtn.getAttribute('href') === tabHref);
  });

  const selectedTab = document.querySelector(tabHref);
  const tabContainer = selectedTab.parentNode;
  if (!tabContainer) {
    selectedTab.classList.toggle('show');
    return;
  }
  Array
    .from(tabContainer.querySelectorAll('.tabs__content'))
    .forEach(tabContent => {
      tabContent.classList.toggle('show', tabContent === selectedTab);
    });
};

/**
 * Initialize module
 */
export const initTabs = () => {
  $('body').on('click', '.js-select-tab', (e) => {
    e.preventDefault();
    const tabHref = e.target.getAttribute('href');
    selectTab(tabHref);    
  });
};
