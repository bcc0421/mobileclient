import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from "../../../providers/NativeService";
import { HttpService } from "../../../providers/http.service";
/**
 * Generated class for the StrokePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-verify',
  templateUrl: 'verify.html',
})
export class verifyPage {
  verifyList=[];
  rejectPage: any = 'rejectPage';
  constructor(public navCtrl: NavController, public navParams: NavParams, public native: NativeService, private httpService: HttpService, ) {

  }
  getverifyList(){
    let requestInfo = {
      url: "mobilegrid/getcurrentexamineevent"
    }
    this.httpService.post(requestInfo.url, requestInfo).subscribe(data => {
      try {
        let res = data.json();
        if (res.error) {
          this.native.showToast(res.error.error);
        } else {
          this.verifyList = res.success;
        }
      } catch (error) {
        this.native.showToast(error);
      }
    }, err => {
      this.native.showToast(err);
    });
  }
  ionViewDidLoad() {
    this.getverifyList();
  }
}
