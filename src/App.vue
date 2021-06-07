<template lang="pug">
.trello__background
  .trello__nav
    .trello__nav__leftGroup
      .trello__nav__more
        .trello__nav__more__img
      .trello__nav__home
        .trello__nav__home__img
      .trello__nav__kanban
        .trello__nav__kanban__img
        .trello__nav__kanban__text 看板
      .trello__nav__search
        .trello__nav__search__text 跳到...
        .trello__nav__search__icon
    .trello__nav__centerBtn 
      .trello__nav__centerBtn__icon
      .trello__nav__centerBtn__text Trello
    .trello__nav__rightGroup
      .trello__nav__add
        .trello__nav__add__img
      .trello__nav__tips
        .trello__nav__tips__img
      .trello__nav__bell
        .trello__nav__bell__img
      .trello__nav__account 訪客
  .trello__header
    .trello__header__left
      .trello__header__kanban
        .trello__header__kanban__icon
        .trello__header__kanban__text 看板
        .trello__header__kanban__arrayIcon
      .trello__header__kanbanName test
      .trello__header__star
      .trello__header__user 訪客
      .trello__header__work 開放觀看權限的工作區
      .trello__header__userGroup 訪客
      .trello__header__invite 邀請
    .trello__header__right
      .trello__header__invite Butler
      .trello__header__menu 顯示選單
</template>

<script>

export default {
  name: 'index',
}
</script>

<style lang="scss" scoped>
  @import './style.scss';
</style>
