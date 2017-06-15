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
  getHistoryRoute() {
    let path = (window.history.state && window.history.state.path) || '';
    let queryStr = window
      .location
      .hash
      .split('?')[1];
    let params = queryStr
      ? queryStr.split('&')
      : [];
    let query = {};
    params.map((item) => {
      let temp = item.split('=');
      query[temp[0]] = temp[1];
    });

    return {path: path, query: query};
  }
}

/**
 * declare route: { path: '/xx', filename: 'xxx', initFunc(){}}
 *
 *
 * @class YugaRouter
 */

class SPARouter {
  constructor(el, routers, mode) {
    this.el = el;
    this.mode = mode || 'hash';
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
    if (this.mode === 'history') {
      window.addEventListener('popstate', (e) => {
        console.log('popstate')
        this.routeUpdate();
      });
      // 禁用所有a 链接默认跳转事件
      let self = this;
      document.addEventListener('click', function (e) {
        let target = e.target || e.srcElement;
        if (target.tagName === 'A') {
          e.preventDefault();
          let href = target.getAttribute('href');
          let path = href.split('?')[0];
          window
            .history
            .pushState({
              path: path
            }, null, href);
          self.routeUpdate();
        }
      })
    } else {
      window.addEventListener('hashchange', () => {
        console.log('hashchange')
        this.routeUpdate();
      });
    }
  }
  loadComponent() {
    let self = this;
    if (typeof(self.currentRoute.fn) === 'function') {
      self
        .currentRoute
        .fn(self.el, self.currentRoute);
    } else {
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
    let getLocation = this.mode === 'history'
      ? this.utils.getHistoryRoute
      : this.utils.getHashRoute;
    let currentLocation = getLocation();
    this.currentRoute.query = currentLocation['query']
    this
      .routers
      .map((item) => {
        if (item.path === currentLocation.path) {
          this.currentRoute = item;
          this.refresh();
        }
      });
    if (!this.currentRoute.path) {
      if (this.mode === 'history') {
        window
          .history
          .pushState({
            path: '/index'
          }, null, '/index');
        this.routeUpdate();
      } else {
        location.hash = '/index';
      }

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