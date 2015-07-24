/* global $ */
'use strict';

/**
 * @ngdoc overview
 * @name geopagosApp
 * @description
 * # geopagosApp
 *
 * Main module of the application.
 */
angular
	.module('nestable', [
		'ui.bootstrap'
	])
	.config(function() {
	}).run(function($rootScope) {
		$rootScope.list = [{
			item: {
				name: 'nestable1'
			},
			children: []
		}, {
			item: {
				name: 'nestable2'
			},
			children: [{
				item: {
					name: 'nestable2-child1'
				},
				children: []
			}]
		}];

	});

(function() {
	var attrs = {
		'rootClass': 'uk-nestable',
		'listClass': '', // TBI
		'itemClass': 'uk-nestable-item',
		'dragClass': '', // TBI
		'handle': true,
		'handleClass': 'uk-nestable-handle',
		'collapsedClass': '', // TBI
		'placeClass': '' // TBI
	};
	var scope = {};

	_.forIn(attrs, function(v, k) {
		scope[k] = '@';
	});

	scope.list = '=';
	scope.action = '&';
	scope.defaultItem = '@';

	angular.module('nestable')
		.directive('nestable', function () {
			return {
				scope: scope,
				templateUrl: 'nestable.html',
				restrict: 'E',
				require: '?^^nestable',
				controller: 'nestableCtrl',
				controllerAs: 'ctrl',
				bindToController: true,
				link: function(scope, el, attr, ctrl) {
					if (ctrl) {
						scope.parent = ctrl;
						scope.ctrl.action = ctrl.action;
					}
				}
			};
		})
		.controller('nestableCtrl', function($scope, $element) {
			var that = this;
			that.options = {};
			$scope.$watch('parent', function(val) {
				_.forIn(attrs, function(v, k) {
					that.options[k] = that[k] || (val && val.options[k] !== undefined ? val.options[k] :  v);
				});
			});

			if ($element.parent()[0].tagName !== 'LI') {
				$scope.$watch('', _.debounce(function() {
					var uk = $.UIkit.nestable($element);
					uk.on('stop.uk.nestable', function(ev, uk) {
						scope.action(uk);
					}, 10);
				}));
			}
			return this;
		})
		.directive('nestableItem', function($compile) {
			return {
				scope: {
					item: '='
				},
				require: '^nestable',
				templateUrl: 'nestableItem.html',
				restrict: 'E',
				link: function(scope, el, attr, ctrl) {
					if (scope.item.children.length) {
						var nestable = $compile('<nestable ng-if="item.children.length" list="item.children" class="children"></nestable>')(scope);
						el.append(nestable);
					}

					_.assign(scope, ctrl.options);
					scope.action = function(obj, $event) {
						$event.preventDefault();
						$event.stopPropagation();
						ctrl.action(obj);
					};

					scope.updateCategoryName = _.debounce(function(newName) {
						console.log(scope.item.item, newName);
					});
				},
				controller: 'nestableItemCtrl',
				replace: true
			};
		})
		.controller('nestableItemCtrl', function($scope) {
			$scope.editing = !$scope.item.item.categoryId;
		});

})();
