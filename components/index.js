SPA_RESOLVE_INIT = function ($el, $router) {
		$el.innerHTML = `<p style="color:#099fde;">当前异步渲染首页${$router.path}</p>`
		console.log($router)
}