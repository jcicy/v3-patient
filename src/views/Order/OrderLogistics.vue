<script setup lang="ts">
import type { Location, Logistics } from '@/types/order'
import { onMounted } from 'vue'
import { ref } from 'vue'
import { getLogisticsInfo } from '@/services/order'
import { useRoute } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'
import startImg from '@/assets/start.png'
import endImg from '@/assets/end.png'
import currImg from '@/assets/car.png'
const route = useRoute()
// 物流详情
const logistics = ref<Logistics>()
onMounted(async () => {
  const res = await getLogisticsInfo(route.params.id as string)
  logistics.value = res.data
  initMap() // 地图初始化
})
window._AMapSecurityConfig = {
  securityJsCode: '7d12d8ae6bb6d773153268f804a0b094' // 秘钥
}

// 创建地图实例  - 初始化
const initMap = () => {
  AMapLoader.load({
    key: '750b4324e235f6ab7a8a9081dd2c4780', //申请好的Web端开发者 Key，调用 load 时必填
    version: '2.0' //指定要加载的 JS API 的版本，缺省时默认为 1.4.15
  })
    .then((AMap) => {
      // 地图实例
      const map = new AMap.Map('map', {
        zoom: 12, // 缩放
        mapStyle: 'amap://styles/whitesmoke'
      })
      // 路径规划
      if (
        logistics.value?.logisticsInfo &&
        logistics.value.logisticsInfo.length >= 2
      ) {
        const list = [...logistics.value.logisticsInfo]
        AMap.plugin('AMap.Driving', function () {
          console.log(logistics.value?.logisticsInfo)
          const driving = new AMap.Driving({
            map, // 指定渲染的地图实例
            showTraffic: false, // 关闭道路情况
            hideMarkers: true // 关闭沿途标记
            // policy: 0 //驾车路线规划策略，0是速度优先的策略
          })

          // 创建标记函数
          const getMarker = (
            image: string,
            point: Location,
            width = 25,
            height = 30
          ) => {
            // 创建icon实例
            const icon = new AMap.Icon({
              size: new AMap.Size(width, height), // 图标尺寸
              image, // icon图像
              imageSize: new AMap.Size(width, height)
            })
            // 将icon实例添加到marker上
            const marker = new AMap.Marker({
              position: new AMap.LngLat(point?.longitude, point?.latitude), // 坐标
              offset: new AMap.Pixel(-width / 2, -height), // 左侧偏移宽度的1/2, 上方自身高度
              icon // icon实例
            })
            return marker
          }

          const start = list.shift() //起始点坐标
          const startMarker = getMarker(startImg, start!)
          // 将marker添加到地图上
          map.add(startMarker)

          const end = list.pop() //终点坐标
          const endMarker = getMarker(endImg, end!)
          // 将marker添加到地图上
          map.add(endMarker)

          const opts = {
            // 途径点 位置坐标
            waypoints: list.map((item) => [item.longitude, item.latitude])
          }
          driving.search(
            [start?.longitude, start?.latitude],
            [end?.longitude, end?.latitude],
            opts,
            function () {
              // 地图路线规划完毕
              // 当前位置坐标
              const curr = logistics.value?.currentLocationInfo
              // 当前运输点的标记绘制
              const currMarker = getMarker(currImg, curr!, 50, 30)
              // 将marker添加到地图上
              map.add(currMarker)

              // 3s后定位到当前运输位置
              setTimeout(() => {
                // 定位运输位置
                map.setFitView([currMarker])
                // 设置缩放级别
                map.setZoom(10)
              }, 3000)
            }
          )
        })
      }
    })
    .catch((e) => {
      console.error(e) //加载错误提示
    })
}
</script>

<template>
  <div class="order-logistics-page" v-if="logistics">
    <div id="map">
      <div class="title">
        <van-icon name="arrow-left" @click="$router.back()" />
        <span>{{ logistics.statusValue }}</span>
        <van-icon name="service" />
      </div>
      <div class="current">
        <p class="status">
          订单{{ logistics.statusValue }} 预计{{ logistics.estimatedTime }}送达
        </p>
        <p class="predict">
          <span>{{ logistics.name }}</span>
          <span>{{ logistics.awbNo }}</span>
        </p>
      </div>
    </div>
    <div class="logistics">
      <p class="title">物流详情</p>
      <van-steps direction="vertical" :active="0">
        <van-step v-for="item in logistics.list" :key="item.id">
          <p class="status">{{ item.statusValue }}</p>
          <p class="content">{{ item.content }}</p>
          <p class="time">{{ item.createTime }}</p>
        </van-step>
      </van-steps>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-logistics-page {
  --van-step-icon-size: 18px;
  --van-step-circle-size: 10px;
}
#map {
  height: 450px;
  background-color: var(--cp-bg);
  overflow: hidden;
  position: relative;
  .title {
    background-color: #fff;
    height: 46px;
    width: 355px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    font-size: 16px;
    position: absolute;
    left: 10px;
    top: 10px;
    box-sizing: border-box;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    > span {
      flex: 1;
      text-align: center;
    }
    .van-icon {
      font-size: 18px;
      color: #666;
      &:last-child {
        color: var(--cp-primary);
      }
    }
  }
  .current {
    height: 80px;
    border-radius: 4px;
    background-color: #fff;
    height: 80px;
    width: 355px;
    box-sizing: border-box;
    padding: 15px;
    position: absolute;
    left: 10px;
    bottom: 10px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    .status {
      font-size: 15px;
      line-height: 26px;
    }
    .predict {
      color: var(--cp-tip);
      font-size: 13px;
      margin-top: 5px;
      > span {
        padding-right: 10px;
      }
    }
  }
}
.logistics {
  padding: 0 10px 20px;
  .title {
    font-size: 16px;
    padding: 15px 5px 5px;
  }
  .van-steps {
    :deep(.van-step) {
      &::after {
        display: none;
      }
    }
    .status {
      font-size: 15px;
      color: var(--cp-text3);
      margin-bottom: 4px;
    }
    .content {
      font-size: 13px;
      color: var(--cp-tip);
      margin-bottom: 4px;
    }
    .time {
      font-size: 13px;
      color: var(--cp-tag);
    }
  }
}
</style>
