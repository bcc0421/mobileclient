import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { NativeService } from "../../../providers/NativeService";
import { HttpService } from "../../../providers/http.service";
import { MapService } from '../map-service';
import _ from 'lodash'
/**
 * Generated class for the PeslistPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var AMap;
@IonicPage()
@Component({
  selector: 'page-peslist',
  templateUrl: 'peslist.html',
})
export class PeslistPage {
  root: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public native: NativeService, private httpService: HttpService, public viewCtrl: ViewController, private mapService: MapService) {
    this.root = this.native.appServer.file;
    
  }
  initInfo(){
    this.mapService.getDeptPerson().then(res=>{
      this.deptPersonList=res;
      // this.mygetAddress(res);
    },err=>{
      console.log(err);
    });
  }
  ionViewDidEnter() {
    
  }
  ionViewDidLoad() {
    let deptPersonList = this.navParams.get('personList');
    // const arr = deptPersonList.filter(obj =>{
    //   return obj.states
    // })
    this.allPersonList = _.orderBy(deptPersonList, ['states', 'date'], ['desc', 'desc']);
    this.deptPersonList = []
    // if(this.deptPersonList){
    //   // this.mygetAddress(this.deptPersonList);
    // }else{
    //   this.initInfo();
    // }
    const arr =_.take(this.allPersonList, this.allPersonList.length <= 20?this.allPersonList.length:20);
    this.allPersonList=_.drop(this.allPersonList, this.allPersonList.length <= 20?this.allPersonList.length:20);
    this.deptPersonList.push(...arr)
    console.log(this.deptPersonList)
    console.log('ionViewDidLoad PeslistPage');
  }
  deptPersonList: any;
  allPersonList: any;
  viewMessages(obj?) {
    this.viewCtrl.dismiss(obj);
  }
  goWhat(obj,type){ //跳转
    if(type==1){
      if (obj.location.user_id == this.native.UserSession._id) {
        this.native.showToast('抱歉,不能与自己沟通');
        return;
      }
      this.navCtrl.push('ChatUserPage', { username: 'yzwg_' + obj.location.user_id })
    }else if(type == 2) {
      obj.location.user_id
      const userArr = this.native.UserList;
      userArr.forEach(element => {
        if(obj.location.user_id == element._id) {
          console.log(`tel:${element.mobile}`)
          location.href = `tel:${element.mobile}`;
        }
      });
    }
  }
  mygetAddress(res) {//逆地理编码
    let geocoder = new AMap.Geocoder({
      radius: 1000,
      extensions: "all"
    });
    for (let i in res) {
      this.deptPersonList[i].address = '正在获取位置信息...'

      if (res[i].position) {
        geocoder.getAddress(res[i].position, (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            this.deptPersonList[i].address = result.regeocode.formattedAddress;
          }
        });
      } else {
        this.deptPersonList[i].address = '暂未上传位置信息...'
      }
    }
  }
  doInfinite(infiniteScroll){
    console.log('infiniteScroll');
    const arr =_.take(this.allPersonList, this.allPersonList.length <= 20?this.allPersonList.length:20);
    this.allPersonList=_.drop(this.allPersonList, this.allPersonList.length <= 20?this.allPersonList.length:20);
    this.deptPersonList.push(...arr)
    infiniteScroll.complete(); 
    if(this.allPersonList.length == 0) {
      infiniteScroll.enable(false);
    } 
  }
}
