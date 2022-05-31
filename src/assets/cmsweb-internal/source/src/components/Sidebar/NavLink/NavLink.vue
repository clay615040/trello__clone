<template>
  <div v-if="!childrenLinks && isHeader" :class="{headerLink: true, className}">
    <router-link :to="link" class="sidebar-link">
      <span class="icon">
        <i :class="fullIconName" aria-hidden="true"></i>
      </span>
      {{ $t(changeText(header)) }} <sup v-if="label" :class="'text-' + labelColor" class="headerLabel">{{label}}</sup>
      <b-badge v-if="badge" variant="primary" pill>{{badge}}</b-badge>
    </router-link>
  </div>
  <!-- 外層 -->
  <div v-else-if="childrenLinks" :class="{headerLink: true, className}">
    <div @click="() => togglePanelCollapse(link)">
      <router-link :to="link" event="" class="d-flex sidebar-link">
        <span v-if="isHeader" class="icon">
          <i :class="fullIconName" aria-hidden="true"></i>
        </span>
        {{ $t(changeText(header)) }} <sup v-if="label" :class="'text-' + labelColor" class="ml-1 headerLabel">{{label}}</sup>
        <div :class="{caretWrapper: true, carretActive: isActive}">
          <i class="fa fa-angle-left" aria-hidden="true"/>
        </div>
      </router-link>
    </div>
    <!-- 內層 -->
    <b-collapse :id="'collapse' + index" :visible="isActive">
      <ul class="sub-menu">
        <NavLink v-for="link in childrenLinks"
          :activeItem="activeItem"
          :header="$t(changeText(link.name))"
          :index="link.name"
          :link="link.link"
          :childrenLinks="link.child"
          :key="link.link">
        </NavLink>
      </ul>
    </b-collapse>
  </div>
  <div v-else>
    <router-link :to="index !== 'menu' && link">
      {{header}} <sup v-if="label" :class="'text-' + labelColor" class="headerLabel">{{label}}</sup>
    </router-link>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { MENU_LIST } from '@/configs/site.js'

export default {
  name: 'NavLink',

  props: {
    badge: { type: String, dafault: '' },
    header: { type: String, default: '' },
    iconName: { type: String, default: '' },
    headerLink: { type: String, default: '' },
    link: { type: String, default: '' },
    childrenLinks: { type: Array, default: null },
    className: { type: String, default: '' },
    isHeader: { type: Boolean, default: false },
    deep: { type: Number, default: 0 },
    activeItem: { type: String, default: '' },
    label: { type: String },
    labelColor: { type: String, default: 'warning' },
    index: { type: String },
  },

  data() {
    return {
      headerLinkWasClicked: true,
    };
  },

  methods: {
    ...mapActions('layout', ['changeSidebarActive']),

    togglePanelCollapse(link) {
      this.changeSidebarActive(link);
      this.headerLinkWasClicked = !this.headerLinkWasClicked || !this.activeItem.includes(this.index);
    },

    changeText(item) {
      return MENU_LIST.find(node => node.routerName === item)?.name ?? item
    }
  },
  computed: {
    fullIconName() {
      return `${this.iconName}`;
    },

    isActive() {
      return (this.activeItem
      && this.activeItem.includes(this.index)
      && this.headerLinkWasClicked)
    },
  },
}
</script>

<style src="./NavLink.scss" lang="scss" scoped />
