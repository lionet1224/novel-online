import config from './config'
import {
	toObj,
	toStr,
	getSet,
	getId,
	getBookData,
	setBookData,
	addBookData,
	updateBookData,
  loadFont,
  bottomBarBind,

  register,
  registerCode,
  login,
  setCookie
} from './tool'
import '../style/bootstrap.css'
import '../style/style.css'

window.onload = () => {
new Vue({
    el: '#app',
    data: {
      io: null,
      personNumber: 0,
      errors: [],
      infos: [],

      type: 'login',

      register: {
        username: "",
        email: '',
        password: '',
        confirm_password: '',
        authCode: ''
      },
      login: {
        email: '',
        password: ''
      }
    },
    watch: {
      errors(){
        $('html, body').scrollTop(0)
      },
      infos(){
        $('html, body').scrollTop(0)
      }
    },
    computed: {
      registerFlag(){
        let flag = false;
        Object.values(this.register).map(val => {
          if(val == "") flag = true;
        })
        return flag;
      },
      loginFlag(){
        let flag = false;
        Object.values(this.login).map(val => {
          if(val == "") flag = true;
        })
        return flag;
      }
    },
    methods: {
        bindIo(fn){
            this.id = getId();
            this.io.emit('conn', this.id);
            this.io.on('conn', msg => {
                console.log(msg)
                fn.call(this);
                this.io.on('webPersonNumber', res => {
                    this.personNumber = res;
                })
            })
        },
        getHref(type){
          return '?' + toStr({
            type, to: this.to
          })
        },
        sendAuthCode(){
          registerCode(this.register.email).then(res => {
            this.infos = [`邮件发送成功，请查收！`]
          }).catch(err => {
            this.errors = [];
            this.errors.push(err.response.data.msg)
          })
        },
        pushError(obj){
          this.errors = [];
          Object.keys(obj).forEach(key => {
            this.errors.push(`${key}: ${obj[key]}`);
          })
        }
    },
    mounted(){
      let data = toObj(location.search);
      if(data.type){
        this.type = data.type;
      }
      this.to = data.to;

      this.io = io(`ws://${config.socket.ip}:${config.socket.port}`);
      this.bindIo(() => {

      });
      bottomBarBind();
      loadFont();

      setTimeout(() => {
        $('.form input').focus(function(){
          $('form .row .f-m').hide();
          $(this).parents('.row').find('.f-m').show();
        })

        let formName = '';
        if(this.type == 'login'){
          formName = '.login-form';
        } else {
          formName = '.register-form'
        }
        let rule = new Rule(formName, true);
        rule.validator.create('email|这不是一个邮箱', val => {
          if(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)){
            return true;
          }
        })
        rule.validator.setErrorInfo('required', '这个值是必须值');
        rule.validator.setErrorInfo('min', '这个值最小值需为{{num}}');
        rule.validator.setErrorInfo('max', '这个值最大值需为{{num}}');
        rule.validator.setErrorInfo('dbpassword', '这个值需要与密码一致');
        
        rule.submit(errors => {
          if(Object.keys(errors).length){
            this.pushError(errors);
            return;
          }
          if(this.type == 'login'){
            login(this.login.email, this.login.password)
            .then(res => {
              this.infos = [];
              this.errors = [];
              let msg = '登录成功, 即将跳转到';

              setCookie('userToken', res.data.data.token);
              if(this.to == 'undefined' || this.to == null || this.to == undefined || this.to == ''){
                this.to = 'index'
              }
              msg += this.to;
              setTimeout(() => {
                location.href = this.to + '.html';
              }, 1000);
              this.infos.push(msg);
            }).catch(err => {
              this.infos = [];
              this.errors = [];
              this.errors.push(err.response.data.msg)
            })
          } else {
            register(this.register.username, this.register.password, this.register.authCode, this.register.email)
            .then(res => {
              this.infos = [];
              this.errors = [];
              this.infos.push(`注册成功, 即将跳转至登录页面`);
              setTimeout(() => {
                location.href = this.getHref('login');
              }, 1000);
            }).catch(err => {
              this.infos = [];
              this.errors = [];
              this.errors.push(err.response.data.msg)
            })
          }
        })
      }, 0);
    }
})
}