class Utils {
  getHashRoute() {
    let hashDetail = window
      .location
      .hash
      .split('?');
    let hashName = hashDetail[0].split('#')[1];
    let params = hashDetail[1]
      ? hashDetail[1].split('&')
      : [];
    let query = {};
    params.map((item) => {
      let temp = item.split('=');
      query[temp[0]] = temp[1];
    });

    return {path: hashName, query: query};
  }
}

/**
 * declare route: { path: '/xx', filename: 'xxx', initFunc(){}}
 *
 *
 * @class YugaRouter
 */

class SPARouter {
  constructor(el, routers) {
    this.el = el;
    this.utils = new Utils();
    this.currentRoute = {};
    this.beforeFunc = null;
    this.afterFunc = null;
    this.initRouters(routers);
    this.init();
  }
  init() {
    window.SPA_RESOLVE_INIT = null;
    this.initEvent();
  }
  initRouters(routers) {
    this.routers = routers.map((item) => {
      item.$router = this;
      return item;
    });
  }
  initEvent() {
    window.addEventListener('load', () => {
      console.log('load')
      this.routeUpdate();
    });
    window.addEventListener('hashchange', () => {
      console.log('hashchange')
      this.routeUpdate();
    });
  }
  loadComponent() {
    let self = this;
    if (this.currentRoute.filename) {
      var _body = document.getElementsByTagName('body')[0];
      var scriptEle = document.createElement('script');
      scriptEle.src = self.currentRoute.filename;
      scriptEle.async = true;
      scriptEle.type = 'text/javascript';
      window.SPA_ROUTE_INIT = null;
      scriptEle.onload = () => {
        self.afterFunc && self.afterFunc(self.currentRoute);
        self.currentRoute.fn = window.SPA_RESOLVE_INIT;
        self
          .currentRoute
          .fn(self.el, self.currentRoute);
      }
      _body.appendChild(scriptEle);
    } else {
      if (self.currentRoute.initFunc) {
        self
          .currentRoute
          .initFunc(self.el, self.currentRoute);
        self.afterFunc && self.afterFunc(self.currentRoute);
      } else {
        console.trace('该路由定义出错，filename 和 initFunc 必须定义一个')
      }

    }

  }
  refresh(currentHash) {
    let self = this;
    if (self.beforeFunc) {
      self.beforeFunc({
        path: self.currentRoute.path,
        query: self.currentRoute.query
      }, () => {
        self.loadComponent();
      })
    } else {
      self.loadComponent();
    }

  }
  routeUpdate() {
    let currentHash = this
      .utils
      .getHashRoute();
    this.currentRoute.query = currentHash['query']
    this
      .routers
      .map((item) => {
        if (item.path === currentHash.path) {
          this.currentRoute = item;
          this.refresh();
        }
      });
    if (!this.currentRoute.path) {
      location.hash = '/index';
    }
  }
  beforeEach(callback) {
    if (Object.prototype.toString.call(callback) === '[object Function]') {
      this.beforeFunc = callback;
    } else {
      console.trace('路由切换前钩子函数不正确')
    }
  }
  afterEach(callback) {
    if (Object.prototype.toString.call(callback) === '[object Function]') {
      this.afterFunc = callback;
    } else {
      console.trace('路由切换后钩子函数不正确')
    }
  }

}