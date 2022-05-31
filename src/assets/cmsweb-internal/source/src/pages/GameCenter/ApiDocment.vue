<template>
  <div class="ApiDocment">
    <widget class="mb-4" customHeader>
      <b-button-toolbar class="mt-lg justify-content-end d-print-none">
        <a href="https://documenter.getpostman.com/view/11624571/TzzEntrz" target="_blank">
          <b-button variant="success">
            {{ $t('查看API文件') }}
            &nbsp;
            <span class="circle bg-white">
              <i class="fa fa-arrow-right text-success" aria-hidden="true"/>
            </span>
          </b-button>
        </a>
      </b-button-toolbar>
      <img src="./image/api_ex.jpg" alt="api_image">
    </widget>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget'

export default {
    name: 'ApiDocment',
    components: { 
      'widget': Widget,
    },

    beforeRouteEnter (to, from, next) {
      window.open('https://documenter.getpostman.com/view/11624571/TzzEntrz')
    },
}
</script>

<style lang="scss">
  .ApiDocment {
    img {
      margin-top: 8px;
      width: 100%;
      height: 100%;
    }
  }
</style>