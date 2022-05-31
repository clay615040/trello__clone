<template lang="pug">
  h6.mt-3 {{ $t('當局資訊') }}
    v-client-table(name="roundInfo" :columns="colRoundInfoDetail" :options="optRoundInfoDetail" :data="[detail.round_info]" ref="tbRecord")
      template(slot="card" slot-scope="props")       
        span.row.ml-0
          span.pr-2.text-center(v-for="(image, index) in props.row.card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      template(slot="_cards" slot-scope="props")       
        span.row.ml-0
          span.pr-2.text-center(v-for="(image, index) in props.row._cards" :key="index")             
            img.imgCard(:src="`/images/game/${mahJongList[image]}`" :alt="image")
      //- 莊家牌
      template(slot="banker_card" slot-scope="props")       
        span.row.ml-0
          span.pr-1.text-center(v-for="(image, index) in props.row.banker_card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      //- 百人德撲-莊家牌
      template(slot="banker_card_type" slot-scope="props")       
        span.row.ml-0.mb-1
          span.pr-1.text-center(v-for="(image, index) in props.row.banker_result_card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
        span {{ props.row.banker_card_type }}
      //- 百人德撲-公共牌
      template(slot="public_card" slot-scope="props")       
        span.row.ml-0
          span.pr-1.text-center(v-for="(image, index) in props.row.public_card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      //- blackJack閒家牌
      template(slot="blackJackPlayerCard" slot-scope="props")       
        span.row.ml-0(v-for="(item, index) in props.row.player_card" :key="index")
          span.pr-2.pb-3.text-center(v-for="(image, index) in item" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      //- 閒家牌
      template(slot="player_card" slot-scope="props")       
        span.row.ml-0
          span.pr-1.text-center(v-for="(image, index) in props.row.player_card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      //- 百人德撲-閒家牌
      template(slot="player_card_type" slot-scope="props")       
        span.row.ml-0.mb-1
          span.pr-1.text-center(v-for="(image, index) in props.row.player_result_card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
        span.mt-1 {{ props.row.player_card_type }}
      //- 龍牌型
      template(slot="dragon_card" slot-scope="props")
        span.row.ml-0
          span.pr-2.text-center(v-for="(image, index) in props.row.dragon_card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      //- 虎牌型
      template(slot="tiger_card" slot-scope="props")
        span.row.ml-0
          span.pr-2.text-center(v-for="(image, index) in props.row.tiger_card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      //- 閒家 1
      template(slot="player1_card" slot-scope="props")
        span.row.ml-0
          span.pr-2.text-center(v-for="(image, index) in props.row.player1_card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      //- 閒家 2
      template(slot="player2_card" slot-scope="props")
        span.row.ml-0
          span.pr-2.text-center(v-for="(image, index) in props.row.player2_card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      //- 閒家 3
      template(slot="player3_card" slot-scope="props")
        span.row.ml-0
          span.pr-2.text-center(v-for="(image, index) in props.row.player3_card" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      //- 骰寶
      template(slot="dice" slot-scope="props")
        span.row.ml-0
          span.pr-2.text-center(v-for="(image, index) in props.row.dice" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      template(slot="super_number" slot-scope="props")
        div.row.ml-0(v-for="(item, index) in props.row.super_number" :key="index")
          div.pr-2.text-center(v-if="item.description !== ''")             
            .row.ml-0 {{ item.description }}, {{ $t('賠率') }}: {{ item.payout }}
      template(slot="is_valid" slot-scope="props")
        div {{ props.row.is_valid === 1 ? 'Y' : 'N' }}
      template(slot="game_type" slot-scope="props")
        div {{ props.row.game_type === 1 ? $t('普通輪盤') : $t('超級倍率輪盤') }}
      template(slot="dragon_type" slot-scope="props")
        div {{ changeDragonType(props.row.dragon_type) }}
      template(slot="blackJackGroup" slot-scope="props")
        div.blackJackText {{ $t('火熱3') }}： {{ props.row.hot3_card_type }}
        div.blackJackText {{ $t('21+3') }}： {{ props.row.bj3_card_type }}
        div.blackJackText {{ $t('任意對子') }}： {{ props.row.any_pair_card_type }}
        div.blackJackText {{ $t('莊家爆牌') }}： {{ props.row.bust_it_card_type }}
      template(slot="blackJackGroupCard" slot-scope="props")
        span.row.ml-0
          span.pr-2.pb-3.text-center(v-for="(image, index) in props.row.hot3_cards" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
        span.row.ml-0
          span.pr-2.pb-3.text-center(v-for="(image, index) in props.row.bj3_cards" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
        span.row.ml-0
          span.pr-2.pb-3.text-center(v-for="(image, index) in props.row.any_pair_cards" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
        span.row.ml-0
          span.pr-2.pb-3.text-center(v-for="(image, index) in props.row.bust_it_cards" :key="index")             
            img.imgCard(:src="`/images/game/${image}`" :alt="image")
      //- 超級牛牛 - 莊家牌
      template(slot="superbull_banker_card" slot-scope="props")
        span.row.ml-0
          span.text-center(v-for="(image, index) in props.row.banker_card" :key="index")
            img.superbullImgCard(:src="`/images/game/${image}`" :alt="image")
      //- 超級牛牛 - 閒家 1
      template(slot="superbull_player1_card" slot-scope="props")
        span.row.ml-0(v-if="props.row.player1_card.length>0")  
          span.text-center(v-for="(image, index) in props.row.player1_card" :key="index")       
            img.superbullImgCard(:src="`/images/game/${image}`" :alt="image")
        template(v-else) {{ '-' }}
      //- 超級牛牛 - 閒家 2
      template(slot="superbull_player2_card" slot-scope="props")
        span.row.ml-0(v-if="props.row.player2_card.length>0")  
          span.text-center(v-for="(image, index) in props.row.player2_card" :key="index") 
            img.superbullImgCard(:src="`/images/game/${image}`" :alt="image")
        template(v-else) {{ '-' }}
      //- 超級牛牛 - 閒家 3
      template(slot="superbull_player3_card" slot-scope="props")
        span.row.ml-0(v-if="props.row.player3_card.length>0") 
          span.text-center(v-for="(image, index) in props.row.player3_card" :key="index")      
            img.superbullImgCard(:src="`/images/game/${image}`" :alt="image")
        template(v-else) {{ '-' }}
      //- 超級牛牛 - 閒家 5
      template(slot="superbull_player5_card" slot-scope="props")
        span.row.ml-0(v-if="props.row.player5_card.length>0")   
          span.text-center(v-for="(image, index) in props.row.player5_card" :key="index")     
            img.superbullImgCard(:src="`/images/game/${image}`" :alt="image")
        template(v-else) {{ '-' }}
      //- 超級牛牛 - 閒家 6
      template(slot="superbull_player6_card" slot-scope="props")
        span.row.ml-0(v-if="props.row.player6_card.length>0")
          span.text-center(v-for="(image, index) in props.row.player6_card" :key="index")          
            img.superbullImgCard(:src="`/images/game/${image}`" :alt="image")
        template(v-else) {{ '-' }}
      //- 百人德撲
      template(slot="texasHoldem_cardType" slot-scope="props")
        div {{ $t('底注+') }}： {{ props.row.ante_plus_type }}
        div {{ $t('最佳5張') }}： {{ props.row.best_five_type }}

      //- 賽馬 一般賽事
      template(slot="normal_race" slot-scope="props")
        div(v-for="(item, i) in props.row.normal_race")
          .row.ml-0  ({{ (i + 1)}}){{ $t('賠率') }}: {{ item.odds }},{{ '&nbsp;&nbsp;' + $t('賽果') }}: {{ item.type }},{{ '&nbsp;&nbsp;' + $t('倍率') }}: {{ item.doubly }}
      //- 賽馬 倍率賽事  
      template(slot="doubly_race" slot-scope="props")
        div(v-for="(item, i) in props.row.doubly_race")
          .row.ml-0  ({{ (i + 1)}}){{$t('賠率') }}: {{ item.odds }},{{ '&nbsp;&nbsp;' + $t('賽果') }}: {{ item.type }},{{ '&nbsp;&nbsp;' + $t('倍率') }}: {{ item.doubly }}
      template(slot="room_id" slot-scope="props")
        div {{ props.row.room_id }}

    //- 押注資訊
    .mt-3
      span.float-left
        h6 {{ $t('押注資訊') }}
      span.float-right.mr-2
        h6 {{ $t('資料筆數') }} : {{ countDetail_Format }}
    v-client-table(v-if="detail.bet_info" :columns="colDetail" :options="optDetail" :data="detail.bet_info.bet_list")
      template(slot="card" slot-scope="props")
        .tableCard
          span.pr-2.text-center(v-for="(card, card_index) in props.row.card" :key="card_index")
            div(v-if="Array.isArray(card)" )   
              span(v-for="(image, cardImageIndex) in card" :key="cardImageIndex")
                img.imgCard.mr-2.text-center(:src="`/images/game/${image}`" :alt="image")
            div(v-else)
              img.imgCard(:src="`/images/game/${card}`" :alt="card")
      template(slot="_cards" slot-scope="props")
        .tableCard
          span.pr-2.text-center(v-for="(card, card_index) in props.row._cards" :key="card_index")
            div(v-if="Array.isArray(card)" )   
              span(v-for="(image, cardImageIndex) in card" :key="cardImageIndex")
                img.imgCard.mr-2.text-center(:src="`/images/game/${mahJongList[image]}`" :alt="image")
            div(v-else)
              img.imgCard(:src="`/images/game/${mahJongList[card]}`" :alt="card")
      //- 骰寶
      template(slot="bet_type" slot-scope="props")
        span.row.ml-0
          div(v-if="isImages(props.row.bet_type)")
            span.pr-2.text-center(v-for="(image, index) in changeImgList(props.row.bet_type)" :key="index")             
              img.imgCard(:src="`/images/game/${image}`" :alt="image")
          div(v-else)
            span {{ props.row.bet_type }}
      //- 超級牛牛專用下注類型欄位
      template(slot="superbull_bet_type" slot-scope="props")
        span.row.ml-0
          span {{ '閒' + props.row.chair_id }} - {{ props.row.bet_type }}
      //- Richer3
      template(slot="ante" slot-scope="props")
        div(v-if="props.row.ante")     
          .row.ml-0 {{ $t('投注') }}: {{ props.row.ante.bet_amount }}
          .row.ml-0 {{ $t('贏分') }}: {{ props.row.ante.win_amount }}
          .row.ml-0 {{ $t('服務費') }}: {{ props.row.ante.service_fee }}       
      template(slot="pairPlus" slot-scope="props")
        div(v-if="props.row.pairPlus")                       
          .row.ml-0 {{ $t('投注') }}: {{ props.row.pairPlus.bet_amount }}
          .row.ml-0 {{ $t('贏分') }}: {{ props.row.pairPlus.win_amount }}
          .row.ml-0 {{ $t('服務費') }}: {{ props.row.pairPlus.service_fee }}
      template(slot="play" slot-scope="props")
        div(v-if="props.row.play")
          .row.ml-0 {{ $t('投注') }}: {{ props.row.play.bet_amount }}
          .row.ml-0 {{ $t('贏分') }}: {{ props.row.play.win_amount }}
          .row.ml-0 {{ $t('服務費') }}: {{ props.row.play.service_fee }}
      template(slot="no_commission" slot-scope="props")
        div {{ props.row.no_commission === '1' ? 'Y' : 'N' }}
    
    //- horseracing 賽馬 彩券
    div(v-if="detailGameId === 'horseracing' && detail.bet_info && detail.bet_info.lottery && detail.bet_info.lottery.length > 0")
      span.float-left
        h6 {{ $t('彩票押注') }}
      v-client-table(:columns="colDetail_lottery" :options="optDetail_lottery" :data="detail.bet_info.lottery")
    
    div(v-if="detailGameId === 'richer3'")
      | 1.底注：
      br
      | a.投注：底注下注籌碼數
      br
      | b.贏分：底注 * 對應牌型賠率 *（1-服務費配置）（jp獎池獎勵金額，已扣除服務費）+ 底注盈利金額*（1 - 服務費配置）（依據跟注階段獲勝情況，已扣除服務費）+ 底注本金（依據實際情況，返還底注本金時會增加這筆）
      br
      | c.服務費：底注 * 對應牌型賠率 * 服務費配置（特殊牌型盈利部分抽取服務費）+ 底注盈利金額 * 服務費配置（底注在跟注階段盈利）
      br
      br
      | 2.對子以上：
      br
      | a.投注：對子 + 下注籌碼數
      br
      | b.贏分：“對子 + 下注籌碼數” * 對應牌型賠率 *（1 - 服務費配置） + “對子 + 本金”（中對子 + 時一定會返還對子 + 本金）
      br
      | c.服務費：“對子 + 下注籌碼數” * 對應牌型賠率 * 服務費配置
      br
      br
      | 3.跟注：
      br
      | a.投注：跟注下注籌碼數
      br
      | b.贏分：跟注盈利金額 *（1 - 服務費配置）（依據跟注階段獲勝情況，已扣除服務費）+ 跟注本金（依據實際情況，返還跟注本金時會增加這筆）
      br
      | c.服務費：跟注盈利金額 * 服務費配置
      br
      br
      | 4.JP獎勵金額：當前JP獎池金額 * JP牌型係數 * min（該玩家的押注額 / 押注額上限，100%），其他復雜情況計算規則見附錄4（不扣除服務費）
      br
      br
      | 5.同花寶箱：同花寶箱累計金額（完全獨立，不扣除服務費）

</template>

<script>
import i18n from '@/locales'

export default {
  name: 'BetDetailResult',

  props: {
    detailData: {default: []},
    vendorCode: {default: ''},
    detailGameId: {default: ''},
    countDetail: {default: Number},
  },

  data() {
    return {
      colRoundInfoDetail: [],
      optRoundInfoDetail: {
        perPage: 5,
        perPageValues: [5],          
        pagination: { chunk: 10, dropdown: false, edge: true },
        filterable: false,
        texts: { filter: '', count: '', limit: '' },
        columnsClasses: { 
          id: 'width-100', tax_ratio: 'numberRight', jackpot_ratio: 'numberRight', golden_ratio: 'numberRight',
          doubly_ratio: 'numberRight', diamond_ratio: 'numberRight' },
        skin: 'table table-striped',
        sortable: [],
        sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
        },
        hiddenColumns: [],
        headings: {}
      },

      colDetail: [],
      optDetail: {
        perPage: 5,
        perPageValues: [5],          
        pagination: { chunk: 10, dropdown: false, edge: true },
        filterable: false,
        texts: { filter: '', count: '', limit: '' },
        columnsClasses: { 
          id: 'width-100', bet_amount: 'numberRight', win_amount: 'numberRight', tax_amount: 'numberRight',
          pool_money: 'numberRight', treasure_money: 'numberRight', win_point: 'numberRight', total_win: 'numberRight', platform_tax: 'numberRight',
          service_fee: 'numberRight', win_lose: 'numberRight', jackpot_push_ratio: 'numberRight', total_win_amount: 'numberRight'
        },
        skin: 'table table-striped',
        sortable: [],
        sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
        },
        hiddenColumns: [],
        headings: {}
      },

      colDetail_lottery: [],
      optDetail_lottery: {
        perPage: 5,
        perPageValues: [5],
        pagination: { chunk: 10, dropdown: false },
        filterable: false,
        texts: { filter: '', count: '', limit: '' },
        columnsClasses: { id: 'width-100', win_amount: 'numberRight' },
        skin: 'table table-striped',
        sortable: [],
        sortIcon: {
          base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
        },
        hiddenColumns: [],
        headings: {}
      },
    }
  },
  

  methods: {
    CHANGE_COLUMN_DETAIL() {
      switch(this.vendorCode) {
        case 'audere':
          switch(this.detailGameId) {
            case 'baccarat':
            case 'classicBaccarat':
              this.colRoundInfoDetail = ['banker_card', 'player_card']
              this.optRoundInfoDetail.headings = {
                'banker_card': () => i18n.t('莊家牌'),
                'player_card': () => i18n.t('閒家牌'),                         
              }

              this.colDetail = ['bet_type', 'bet_amount', 'win_amount', 'tax_amount', 'no_commission']
              this.optDetail.headings = {
                'bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),              
                'tax_amount': () => i18n.t('稅金'),              
                'no_commission': () => i18n.t('免傭'),   
              }
              break
            case 'superSix':
            case 'superSixSqueeze':
            case 'superSixInsurance':
              this.colRoundInfoDetail = ['banker_card', 'player_card', 'dragon_type']
              this.optRoundInfoDetail.headings = {
                'banker_card': () => i18n.t('莊家牌'),
                'player_card': () => i18n.t('閒家牌'),
                'dragon_type': () => i18n.t('龍寶'),                     
              }

              this.colDetail = ['bet_type', 'bet_amount', 'win_amount', 'tax_amount', 'no_commission']
              this.optDetail.headings = {
                'bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),              
                'tax_amount': () => i18n.t('稅金'),              
                'no_commission': () => i18n.t('免傭'),   
              }
              break
            case 'dragonTiger':
            case 'superDragonTiger':
              this.colRoundInfoDetail = ['dragon_card', 'tiger_card']
              this.optRoundInfoDetail.headings = {
                'dragon_card': () => i18n.t('dragon'),
                'tiger_card': () => i18n.t('tiger'),
              }

              this.colDetail = ['bet_type', 'bet_amount', 'win_amount', 'tax_amount']
              this.optDetail.headings = {
                'bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),
                'tax_amount': () => i18n.t('稅金'),              
              }
              break
            case 'niuniu':
              this.colRoundInfoDetail = ['banker_card', 'player1_card', 'player2_card', 'player3_card']
              this.optRoundInfoDetail.headings = {
                'banker_card': () => i18n.t('莊家牌'),
                'player1_card': () => i18n.t('閒家牌 1'),
                'player2_card': () => i18n.t('閒家牌 2'),
                'player3_card': () => i18n.t('閒家牌 3'),
              }

              this.colDetail = ['bet_type', 'bet_amount', 'win_amount', 'tax_amount']
              this.optDetail.headings = {
                'bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),
                'tax_amount': () => i18n.t('稅金'),              
              }
              break
            case 'sicbo':
            case 'redBlueDuel':
              this.colRoundInfoDetail = ['dice', 'super_number']
              this.optRoundInfoDetail.headings = {
                'dice': () => i18n.t('開出點數'),
                'super_number': () => i18n.t('超級號碼'),
              }

              this.colDetail = ['bet_type', 'bet_amount', 'win_amount', 'tax_amount']
              this.optDetail.headings = {
                'bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),
                'tax_amount': () => i18n.t('稅金'),              
              }
              break
            case 'roulette':
              this.colRoundInfoDetail = ['game_type', 'ball', 'super_number', 'is_valid']
              this.optRoundInfoDetail.headings = {
                'game_type': () => i18n.t('遊戲類型'),
                'ball': () => i18n.t('開出球號'),
                'super_number': () => i18n.t('超級號碼'),
                'is_valid': () => i18n.t('是否有效局'),
              }

              this.colDetail = ['bet_type', 'bet_amount', 'win_amount', 'tax_amount']
              this.optDetail.headings = {
                'bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),
                'tax_amount': () => i18n.t('稅金'),              
              }
              break
            case 'blackJack':
              this.colRoundInfoDetail = ['banker_card', 'banker_point', 'blackJackPlayerCard', 'player_point', 'blackJackGroup', 'blackJackGroupCard']
              this.optRoundInfoDetail.headings = {
                'banker_card': () => i18n.t('莊家牌'),
                'banker_point': () => i18n.t('莊家點數'),
                'blackJackPlayerCard': () => i18n.t('閒家牌'),
                'player_point': () => i18n.t('閒家點數'),
                'blackJackGroup': () => i18n.t('邊注牌型'),
                'blackJackGroupCard': () => i18n.t('邊注牌面'),
              }

              this.colDetail = ['bet_type', 'bet_amount', 'win_amount', 'tax_amount']
              this.optDetail.headings = {
                'bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),
                'tax_amount': () => i18n.t('稅金'),              
              }
              break
            case 'texasHoldem':
              this.colRoundInfoDetail = ['public_card', 'banker_card', 'banker_card_type', 'player_card', 'player_card_type', 'texasHoldem_cardType']
              this.optRoundInfoDetail.headings = {
                'public_card': () => i18n.t('公共牌'),
                'banker_card': () => i18n.t('莊家手牌'),
                'banker_card_type': () => i18n.t('莊家牌'),
                'player_card': () => i18n.t('閒家手牌'),
                'player_card_type': () => i18n.t('閒家牌'),
                'texasHoldem_cardType': () => i18n.t('邊注牌型'),
              }

              this.colDetail = ['bet_type', 'bet_amount', 'win_amount', 'tax_amount']
              this.optDetail.headings = {
                'bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),
                'tax_amount': () => i18n.t('稅金'),              
              }
              break
          }
          break
        case 'chess':
          switch(this.detailGameId) {
            case 'richer3':
              this.colRoundInfoDetail = ['room_id', 'table_id', 'card', 'seat_id']
              this.optRoundInfoDetail.headings = {
                'room_id': () => i18n.t('廳館'),
                'table_id': () => i18n.t('桌號'),
                'card': () => i18n.t('莊家牌'),
                'seat_id': () => i18n.t('玩家座位'),              
              }

              this.colDetail = ['card', 'chair_id', 'ante', 'pairPlus', 'play', 'pool_money', 'treasure_money']
              this.optDetail.headings = {
                'card': () => i18n.t('閒家牌'),
                'chair_id': () => i18n.t('下注位置'),
                'ante': () => i18n.t('底注'),              
                'play': () => i18n.t('跟注'),
                'pairPlus': () => i18n.t('對子以上'),
                'pool_money': () => i18n.t('獎池'),
                'treasure_money': () => i18n.t('同花寶箱'),
              }
              break

            case 'golden21':
            case 'magic21':
            case 'classic21':
              this.colRoundInfoDetail = ['room_id', 'table_id', 'card', 'point', 'seat_id']
              this.optRoundInfoDetail.headings = {
                'room_id': () => i18n.t('廳館'),
                'table_id': () => i18n.t('桌號'),
                'card': () => i18n.t('莊家牌'),
                'point': () => i18n.t('莊家點數'),              
                'seat_id': () => i18n.t('玩家座位'),              
              }

              this.colDetail = ['chair_id', 'card', 'point', 'bet_amount', 'win_amount', 'service_fee', 'win_lose', 'treasure_money']
              this.optDetail.headings = {
                'chair_id': () => i18n.t('下注位置'),
                'card': () => i18n.t('閒家牌'),
                'point': () => i18n.t('閒家點數'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),
                'service_fee': () => i18n.t('服務費'),
                'win_lose': () => i18n.t('總輸贏'),
                'treasure_money': () => i18n.t('BJ寶箱派彩'),
              }
              break

            case 'treasure':
            case 'gof':
              this.colRoundInfoDetail = ['result_type', 'tax_ratio', 'jackpot_ratio']
              this.optRoundInfoDetail.headings = {
                'result_type': () => i18n.t('開牌結果'),             
                'tax_ratio': () => i18n.t('服務費比例(%)'),             
                'jackpot_ratio': () => i18n.t('彩金獲取(%)'),             
              }

              this.colDetail = ['bet_type', 'bet_amount', 'jackpot_push_ratio']
              this.optDetail.headings = {
                'bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'jackpot_push_ratio': () => i18n.t('彩金貢獻(%)')
              }
              break

            case 'boatracing':
            case 'horseracing':
              this.colRoundInfoDetail = ['race_type', 'normal_race', 'doubly_race', 'lottery', 'tax_ratio', 'jackpot_ratio', 'golden_ratio', 'doubly_ratio', 'diamond_ratio']
              this.optRoundInfoDetail.headings = {
                'race_type': () => i18n.t('賽事類型'),
                'normal_race': () => i18n.t('一般賽事'),
                'doubly_race': () => i18n.t('倍率賽事'),
                'lottery': () => i18n.t('彩票號碼'),   
                'tax_ratio': () => i18n.t('服務費比例'),
                'jackpot_ratio': () => i18n.t('彩金比例'),
                'golden_ratio': () => i18n.t('黃金賽彩金比例'),
                'doubly_ratio': () => i18n.t('倍率賽彩金比例'),            
                'diamond_ratio': () => i18n.t('鑽石賽彩金比例'),            
              }

              this.colDetail = ['bet_type', 'bet_amount', 'win_amount', 'pool_money', 'win_lose', 'service_fee']
              this.optDetail.headings = {
                'bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),
                'pool_money': () => i18n.t('彩票贏分'),               
                'win_lose': () => i18n.t('總輸贏'),
                'service_fee': () => i18n.t('服務費'),
              }
              this.colDetail_lottery = ['bet_type', 'win_amount']
              this.optDetail_lottery.headings = {                 
                'bet_type': () => i18n.t('類型'),
                'win_amount': () => i18n.t('贏分')
              }
              break

            case 'pushdots':
              this.colRoundInfoDetail = ['_cards', 'type', 'server_ratio']
              this.optRoundInfoDetail.headings = {
                '_cards': () => i18n.t('莊家牌'),             
                'type': () => i18n.t('莊家牌型'),             
                'server_ratio': () => i18n.t('服務費比例'),             
              }

              this.colDetail = [
                'bet_area', '_cards', 'type', 'odds', 'bet_amount',
                'win_point', 'total_win', 'platform_tax'
              ]
              this.optDetail.headings = {
                'bet_area': () => i18n.t('下注位置'),
                '_cards': () => i18n.t('閒家牌'),
                'type': () => i18n.t('閒家牌型'),
                'odds': () => i18n.t('賠率') + '/' + i18n.t('倍率'),
                'bet_amount': () => i18n.t('投注'),
                'win_point': () => i18n.t('贏分'),
                'total_win': () => i18n.t('總輸贏'),
                'platform_tax': () => i18n.t('服務費'),
              }
              break
            case 'superbull':
              this.colRoundInfoDetail = [
                'superbull_banker_card', 'superbull_player1_card', 'superbull_player2_card', 'superbull_player3_card', 'superbull_player5_card', 
                'superbull_player6_card'
              ]
              this.optRoundInfoDetail.headings = {
                'superbull_banker_card': () => i18n.t('莊家牌'),
                'superbull_player1_card': () => i18n.t('閒家牌 1'),
                'superbull_player2_card': () => i18n.t('閒家牌 2'),
                'superbull_player3_card': () => i18n.t('閒家牌 3'),
                'superbull_player5_card': () => i18n.t('閒家牌 5'),
                'superbull_player6_card': () => i18n.t('閒家牌 6'),
              }

              this.colDetail = ['superbull_bet_type', 'bet_amount', 'win_amount', 'total_win_amount', 'tax_amount']
              this.optDetail.headings = {
                'superbull_bet_type': () => i18n.t('下注類型'),
                'bet_amount': () => i18n.t('投注'),
                'win_amount': () => i18n.t('贏分'),
                'total_win_amount': () => i18n.t('總輸贏'),              
                'tax_amount': () => i18n.t('服務費'),                         
              }
              break
          }
          break
      }
    },

    isImages(item) {
      return item.includes('.png')
    },

    changeImgList(item) {
      return item.split(",")
    },

    changeDragonType(item) {
      if(item?.[0]?.dragon === 'banker_dragon') return i18n.t('莊龍寶'), item?.[0]?.point
      else if(item?.[0]?.dragon === 'player_dragon') return i18n.t('閒龍寶'), item?.[0]?.point
      else return 'N'
    }
  },

  mounted() {
    this.CHANGE_COLUMN_DETAIL()
  },
}
</script>

