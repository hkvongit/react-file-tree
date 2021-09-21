"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.InternalTreeNode = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _createSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/createSuper"));

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _classnames = _interopRequireDefault(require("classnames"));

var _rcTooltip = _interopRequireDefault(require("rc-tooltip"));

var _contextTypes = require("./contextTypes");

var _util = require("./util");

var _Indent = _interopRequireDefault(require("./Indent"));

var _treeUtil = require("./utils/treeUtil");

require("./styles.less");

require("./treeNode.css");

var _excluded = ["eventKey", "className", "style", "dragOver", "dragOverGapTop", "dragOverGapBottom", "isLeaf", "isStart", "isEnd", "expanded", "selected", "checked", "halfChecked", "loading", "domRef", "active", "data", "onMouseMove"];
var ICON_OPEN = 'open';
var ICON_CLOSE = 'close';
var defaultTitle = '---'; // Action constants

var renameNode = 'renameNode';
var addNewNode = 'addNewNode';
var deleteNode = 'deleteNode';
var uploadNodeData = 'uploadNodeData'; // Keyboard Keys

var enterKey = 'Enter';
var escapeKey = 'Escape';

var InternalTreeNode = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2.default)(InternalTreeNode, _React$Component);

  var _super = (0, _createSuper2.default)(InternalTreeNode);

  function InternalTreeNode() {
    var _this;

    (0, _classCallCheck2.default)(this, InternalTreeNode);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.state = {
      dragNodeHighlight: false,
      isRenameActive: false,
      isInputOnFocus: false,
      isNewNodeCreationActive: false,
      renameActionError: null,
      newNodeCreationError: null
    };
    _this.renameInputRef = /*#__PURE__*/React.createRef();
    _this.newNodeRef = /*#__PURE__*/React.createRef();
    _this.selectHandle = void 0;

    _this.handleDOMKeyPress = function (event) {
      if (event.key === 'Escape') {
        _this.setState({
          isRenameActive: false,
          isNewNodeCreationActive: false
        });
      }
    };

    _this.handleDOMRightClick = function () {
      if (!_this.state.isInputOnFocus) {
        _this.setState({
          isRenameActive: false,
          isNewNodeCreationActive: false,
          renameActionError: null,
          newNodeCreationError: null
        });
      }
    };

    _this.contextMenuContainer = null;
    _this.toolTip = null;

    _this.getContainer = function () {
      if (!_this.contextMenuContainer) {
        _this.contextMenuContainer = document.createElement('div');
        document.body.appendChild(_this.contextMenuContainer);
      }

      return _this.contextMenuContainer;
    };

    _this.renderContextMenu = function (event, nodeData) {
      if (_this.toolTip) {
        _reactDom.default.unmountComponentAtNode(_this.contextMenuContainer);

        _this.toolTip = null;
      }

      var handleAction = function handleAction(action) {
        switch (action) {
          case renameNode:
            _this.setState({
              isRenameActive: true
            });

            setTimeout(function () {
              var _this$renameInputRef$;

              (_this$renameInputRef$ = _this.renameInputRef.current) === null || _this$renameInputRef$ === void 0 ? void 0 : _this$renameInputRef$.focus();
            }, 100);
            break;

          case addNewNode:
            _this.setState({
              isNewNodeCreationActive: true
            });

            setTimeout(function () {
              var _this$newNodeRef$curr;

              (_this$newNodeRef$curr = _this.newNodeRef.current) === null || _this$newNodeRef$curr === void 0 ? void 0 : _this$newNodeRef$curr.focus();
            }, 100);
            break;

          case deleteNode:
            if (typeof _this.props.handleChildDel === 'function') {
              _this.props.handleChildDel(nodeData.key);
            }

            break;

          case uploadNodeData:
            if (typeof _this.props.handleUploadNodeData === 'function') {
              _this.props.handleUploadNodeData(nodeData.key);
            }

            break;

          default:
            console.info('Unhandled context menu option');
        }
      };

      _this.toolTip = /*#__PURE__*/React.createElement(_rcTooltip.default, {
        id: "overlay-example",
        trigger: "click",
        placement: "bottomLeft",
        prefixCls: "rc-tree-contextmenu",
        defaultVisible: true,
        overlay: /*#__PURE__*/React.createElement("div", {
          className: "rc-context-container"
        }, (nodeData === null || nodeData === void 0 ? void 0 : nodeData.contextMenu) && (nodeData === null || nodeData === void 0 ? void 0 : nodeData.contextMenu.map(function (item) {
          return /*#__PURE__*/React.createElement("button", {
            className: "rc-context-menu-button",
            onClick: function onClick() {
              _reactDom.default.unmountComponentAtNode(_this.contextMenuContainer);

              handleAction(item.value);
            }
          }, item.label);
        })))
      }, /*#__PURE__*/React.createElement("span", null));

      var container = _this.getContainer();

      Object.assign(_this.contextMenuContainer.style, {
        position: 'absolute',
        left: "".concat(event.clientX + 5, "px"),
        top: "".concat(event.clientY + 5, "px")
      });

      _reactDom.default.render(_this.toolTip, container);
    };

    _this.onRightClick = function (event, nodeData) {
      _this.renderContextMenu(event, nodeData);
    };

    _this.onSelectorClick = function (e) {
      // Click trigger before select/check operation
      var onNodeClick = _this.props.context.onNodeClick;
      onNodeClick(e, (0, _treeUtil.convertNodePropsToEventData)(_this.props));

      if (_this.isSelectable()) {
        _this.onSelect(e);
      } else {
        _this.onCheck(e);
      }
    };

    _this.onSelectorDoubleClick = function (e) {
      var onNodeDoubleClick = _this.props.context.onNodeDoubleClick;
      onNodeDoubleClick(e, (0, _treeUtil.convertNodePropsToEventData)(_this.props));
    };

    _this.onSelect = function (e) {
      if (_this.isDisabled()) return;
      var onNodeSelect = _this.props.context.onNodeSelect;
      e.preventDefault();
      onNodeSelect(e, (0, _treeUtil.convertNodePropsToEventData)(_this.props));
    };

    _this.onCheck = function (e) {
      if (_this.isDisabled()) return;
      var _this$props = _this.props,
          disableCheckbox = _this$props.disableCheckbox,
          checked = _this$props.checked;
      var onNodeCheck = _this.props.context.onNodeCheck;
      if (!_this.isCheckable() || disableCheckbox) return;
      e.preventDefault();
      var targetChecked = !checked;
      onNodeCheck(e, (0, _treeUtil.convertNodePropsToEventData)(_this.props), targetChecked);
    };

    _this.onMouseEnter = function (e) {
      var onNodeMouseEnter = _this.props.context.onNodeMouseEnter;
      onNodeMouseEnter(e, (0, _treeUtil.convertNodePropsToEventData)(_this.props));
    };

    _this.onMouseLeave = function (e) {
      var onNodeMouseLeave = _this.props.context.onNodeMouseLeave;
      onNodeMouseLeave(e, (0, _treeUtil.convertNodePropsToEventData)(_this.props));
    };

    _this.onContextMenu = function (e) {
      var onNodeContextMenu = _this.props.context.onNodeContextMenu;
      onNodeContextMenu(e, (0, _treeUtil.convertNodePropsToEventData)(_this.props));
    };

    _this.onDragStart = function (e) {
      var onNodeDragStart = _this.props.context.onNodeDragStart;
      e.stopPropagation();

      _this.setState({
        dragNodeHighlight: true
      });

      onNodeDragStart(e, (0, _assertThisInitialized2.default)(_this));

      try {
        // ie throw error
        // firefox-need-it
        e.dataTransfer.setData('text/plain', '');
      } catch (error) {// empty
      }
    };

    _this.onDragEnter = function (e) {
      var onNodeDragEnter = _this.props.context.onNodeDragEnter;
      e.preventDefault();
      e.stopPropagation();
      onNodeDragEnter(e, (0, _assertThisInitialized2.default)(_this));
    };

    _this.onDragOver = function (e) {
      var onNodeDragOver = _this.props.context.onNodeDragOver;
      e.preventDefault();
      e.stopPropagation();
      onNodeDragOver(e, (0, _assertThisInitialized2.default)(_this));
    };

    _this.onDragLeave = function (e) {
      var onNodeDragLeave = _this.props.context.onNodeDragLeave;
      e.stopPropagation();
      onNodeDragLeave(e, (0, _assertThisInitialized2.default)(_this));
    };

    _this.onDragEnd = function (e) {
      var onNodeDragEnd = _this.props.context.onNodeDragEnd;
      e.stopPropagation();

      _this.setState({
        dragNodeHighlight: false
      });

      onNodeDragEnd(e, (0, _assertThisInitialized2.default)(_this));
    };

    _this.onDrop = function (e) {
      var onNodeDrop = _this.props.context.onNodeDrop;
      e.preventDefault();
      e.stopPropagation();

      _this.setState({
        dragNodeHighlight: false
      });

      onNodeDrop(e, (0, _assertThisInitialized2.default)(_this));
    };

    _this.onExpand = function (e) {
      var _this$props2 = _this.props,
          loading = _this$props2.loading,
          onNodeExpand = _this$props2.context.onNodeExpand;
      if (loading) return;
      onNodeExpand(e, (0, _treeUtil.convertNodePropsToEventData)(_this.props));
    };

    _this.setSelectHandle = function (node) {
      _this.selectHandle = node;
    };

    _this.getNodeState = function () {
      var expanded = _this.props.expanded;

      if (_this.isLeaf()) {
        return null;
      }

      return expanded ? ICON_OPEN : ICON_CLOSE;
    };

    _this.hasChildren = function () {
      var eventKey = _this.props.eventKey;
      var keyEntities = _this.props.context.keyEntities;

      var _ref = keyEntities[eventKey] || {},
          children = _ref.children;

      return !!(children || []).length;
    };

    _this.isLeaf = function () {
      var _this$props3 = _this.props,
          isLeaf = _this$props3.isLeaf,
          loaded = _this$props3.loaded;
      var loadData = _this.props.context.loadData;

      var hasChildren = _this.hasChildren();

      if (isLeaf === false) {
        return false;
      }

      return isLeaf || !loadData && !hasChildren || loadData && loaded && !hasChildren;
    };

    _this.isDisabled = function () {
      var disabled = _this.props.disabled;
      var treeDisabled = _this.props.context.disabled;
      return !!(treeDisabled || disabled);
    };

    _this.isCheckable = function () {
      var checkable = _this.props.checkable;
      var treeCheckable = _this.props.context.checkable; // Return false if tree or treeNode is not checkable

      if (!treeCheckable || checkable === false) return false;
      return treeCheckable;
    };

    _this.syncLoadData = function (props) {
      var expanded = props.expanded,
          loading = props.loading,
          loaded = props.loaded;
      var _this$props$context = _this.props.context,
          loadData = _this$props$context.loadData,
          onNodeLoad = _this$props$context.onNodeLoad;

      if (loading) {
        return;
      } // read from state to avoid loadData at same time


      if (loadData && expanded && !_this.isLeaf()) {
        // We needn't reload data when has children in sync logic
        // It's only needed in node expanded
        if (!_this.hasChildren() && !loaded) {
          onNodeLoad((0, _treeUtil.convertNodePropsToEventData)(_this.props));
        }
      }
    };

    _this.renderSwitcherIconDom = function (isLeaf) {
      var switcherIconFromProps = _this.props.switcherIcon;
      var switcherIconFromCtx = _this.props.context.switcherIcon;
      var switcherIcon = switcherIconFromProps || switcherIconFromCtx; // if switcherIconDom is null, no render switcher span

      if (typeof switcherIcon === 'function') {
        return switcherIcon((0, _objectSpread2.default)((0, _objectSpread2.default)({}, _this.props), {}, {
          isLeaf: isLeaf
        }));
      }

      return switcherIcon;
    };

    _this.renderSwitcher = function () {
      var expanded = _this.props.expanded;
      var prefixCls = _this.props.context.prefixCls;

      if (_this.isLeaf()) {
        // if switcherIconDom is null, no render switcher span
        var _switcherIconDom = _this.renderSwitcherIconDom(true);

        return _switcherIconDom !== false ? /*#__PURE__*/React.createElement("span", {
          className: (0, _classnames.default)("".concat(prefixCls, "-switcher"), "".concat(prefixCls, "-switcher-noop"))
        }, _switcherIconDom) : null;
      }

      var switcherCls = (0, _classnames.default)("".concat(prefixCls, "-switcher"), "".concat(prefixCls, "-switcher_").concat(expanded ? ICON_OPEN : ICON_CLOSE));

      var switcherIconDom = _this.renderSwitcherIconDom(false);

      return switcherIconDom !== false ? /*#__PURE__*/React.createElement("span", {
        onClick: _this.onExpand,
        className: switcherCls
      }, switcherIconDom) : null;
    };

    _this.renderCheckbox = function () {
      var _this$props4 = _this.props,
          checked = _this$props4.checked,
          halfChecked = _this$props4.halfChecked,
          disableCheckbox = _this$props4.disableCheckbox;
      var prefixCls = _this.props.context.prefixCls;

      var disabled = _this.isDisabled();

      var checkable = _this.isCheckable();

      if (!checkable) return null; // [Legacy] Custom element should be separate with `checkable` in future

      var $custom = typeof checkable !== 'boolean' ? checkable : null;
      return /*#__PURE__*/React.createElement("span", {
        className: (0, _classnames.default)("".concat(prefixCls, "-checkbox"), checked && "".concat(prefixCls, "-checkbox-checked"), !checked && halfChecked && "".concat(prefixCls, "-checkbox-indeterminate"), (disabled || disableCheckbox) && "".concat(prefixCls, "-checkbox-disabled")),
        onClick: _this.onCheck
      }, $custom);
    };

    _this.renderIcon = function () {
      var loading = _this.props.loading;
      var prefixCls = _this.props.context.prefixCls;
      return /*#__PURE__*/React.createElement("span", {
        className: (0, _classnames.default)("".concat(prefixCls, "-iconEle"), "".concat(prefixCls, "-icon__").concat(_this.getNodeState() || 'docu'), loading && "".concat(prefixCls, "-icon_loading"))
      });
    };

    _this.renderSelector = function () {
      var dragNodeHighlight = _this.state.dragNodeHighlight;
      var _this$props5 = _this.props,
          title = _this$props5.title,
          selected = _this$props5.selected,
          icon = _this$props5.icon,
          loading = _this$props5.loading,
          data = _this$props5.data;
      var _this$props$context2 = _this.props.context,
          prefixCls = _this$props$context2.prefixCls,
          showIcon = _this$props$context2.showIcon,
          treeIcon = _this$props$context2.icon,
          draggable = _this$props$context2.draggable,
          loadData = _this$props$context2.loadData,
          titleRender = _this$props$context2.titleRender;

      var disabled = _this.isDisabled();

      var mergedDraggable = typeof draggable === 'function' ? draggable(data) : draggable;
      var wrapClass = "".concat(prefixCls, "-node-content-wrapper"); // Icon - Still show loading icon when loading without showIcon

      var $icon;

      if (showIcon) {
        var currentIcon = icon || treeIcon;
        $icon = currentIcon ? /*#__PURE__*/React.createElement("span", {
          className: (0, _classnames.default)("".concat(prefixCls, "-iconEle"), "".concat(prefixCls, "-icon__customize"))
        }, typeof currentIcon === 'function' ? currentIcon(_this.props) : currentIcon) : _this.renderIcon();
      } else if (loadData && loading) {
        $icon = _this.renderIcon();
      } // Title


      var titleNode;

      if (typeof title === 'function') {
        titleNode = title(data);
      } else if (titleRender) {
        titleNode = titleRender(data);
      } else {
        titleNode = title;
      }

      var $title = /*#__PURE__*/React.createElement("span", {
        className: "".concat(prefixCls, "-title")
      }, titleNode);
      return /*#__PURE__*/React.createElement("span", {
        ref: _this.setSelectHandle,
        title: typeof title === 'string' ? title : '',
        className: (0, _classnames.default)("".concat(wrapClass), "".concat(wrapClass, "-").concat(_this.getNodeState() || 'normal'), !disabled && (selected || dragNodeHighlight) && "".concat(prefixCls, "-node-selected node-full-opaque"), !disabled && mergedDraggable && 'draggable'),
        draggable: !disabled && mergedDraggable || undefined,
        "aria-grabbed": !disabled && mergedDraggable || undefined,
        onMouseEnter: _this.onMouseEnter,
        onMouseLeave: _this.onMouseLeave,
        onClick: _this.onSelectorClick,
        onDoubleClick: _this.onSelectorDoubleClick,
        onDragStart: mergedDraggable ? _this.onDragStart : undefined
      }, $icon, !_this.state.isRenameActive ? /*#__PURE__*/React.createElement(React.Fragment, null, $title) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
        ref: _this.renameInputRef,
        type: "text",
        onKeyDown: function onKeyDown(e) {
          switch (e.key) {
            case enterKey:
              try {
                var _this$renameInputRef$2;

                _this.props.handleNodeRename((_this$renameInputRef$2 = _this.renameInputRef.current) === null || _this$renameInputRef$2 === void 0 ? void 0 : _this$renameInputRef$2.value);

                _this.setState({
                  isRenameActive: false,
                  renameActionError: null
                });
              } catch (err) {
                _this.setState({
                  renameActionError: err.message ? err.message : JSON.stringify(err)
                });
              }

              break;

            case escapeKey:
              _this.setState({
                isRenameActive: false,
                renameActionError: null
              });

              break;

            default:
              return null;
          }

          return null;
        },
        defaultValue: title.toString(),
        onFocus: function onFocus() {
          return _this.setState({
            isInputOnFocus: true
          });
        },
        onBlur: function onBlur() {
          return _this.setState({
            isInputOnFocus: false
          });
        },
        required: true,
        minLength: 1,
        pattern: "/[^a]/"
      }), _this.state.renameActionError && /*#__PURE__*/React.createElement("div", {
        className: "input-error-container"
      }, _this.state.renameActionError)), _this.renderDropIndicator());
    };

    _this.renderDropIndicator = function () {
      var _this$props6 = _this.props,
          disabled = _this$props6.disabled,
          eventKey = _this$props6.eventKey;
      var _this$props$context3 = _this.props.context,
          draggable = _this$props$context3.draggable,
          dropLevelOffset = _this$props$context3.dropLevelOffset,
          dropPosition = _this$props$context3.dropPosition,
          prefixCls = _this$props$context3.prefixCls,
          indent = _this$props$context3.indent,
          dropIndicatorRender = _this$props$context3.dropIndicatorRender,
          dragOverNodeKey = _this$props$context3.dragOverNodeKey,
          direction = _this$props$context3.direction;
      var mergedDraggable = draggable !== false; // allowDrop is calculated in Tree.tsx, there is no need for calc it here

      var showIndicator = !disabled && mergedDraggable && dragOverNodeKey === eventKey;
      return showIndicator ? dropIndicatorRender({
        dropPosition: dropPosition,
        dropLevelOffset: dropLevelOffset,
        indent: indent,
        prefixCls: prefixCls,
        direction: direction
      }) : null;
    };

    return _this;
  }

  (0, _createClass2.default)(InternalTreeNode, [{
    key: "componentDidMount",
    value: // Isomorphic needn't load data in server side
    function componentDidMount() {
      this.syncLoadData(this.props);
      window.addEventListener('keydown', this.handleDOMKeyPress);
      window.addEventListener('contextmenu', this.handleDOMRightClick);
      this.getContainer();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener('keydown', this.handleDOMKeyPress);
      window.addEventListener('contextmenu', this.handleDOMRightClick);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.syncLoadData(this.props);
    }
  }, {
    key: "isSelectable",
    value: function isSelectable() {
      var selectable = this.props.selectable;
      var treeSelectable = this.props.context.selectable; // Ignore when selectable is undefined or null

      if (typeof selectable === 'boolean') {
        return selectable;
      }

      return treeSelectable;
    }
  }, {
    key: "render",
    value: function render() {
      var _classNames,
          _this2 = this,
          _this$newNodeRef$curr2,
          _this$newNodeRef$curr3,
          _this$newNodeRef$curr4,
          _this$newNodeRef$curr5;

      var _this$props7 = this.props,
          eventKey = _this$props7.eventKey,
          className = _this$props7.className,
          style = _this$props7.style,
          dragOver = _this$props7.dragOver,
          dragOverGapTop = _this$props7.dragOverGapTop,
          dragOverGapBottom = _this$props7.dragOverGapBottom,
          isLeaf = _this$props7.isLeaf,
          isStart = _this$props7.isStart,
          isEnd = _this$props7.isEnd,
          expanded = _this$props7.expanded,
          selected = _this$props7.selected,
          checked = _this$props7.checked,
          halfChecked = _this$props7.halfChecked,
          loading = _this$props7.loading,
          domRef = _this$props7.domRef,
          active = _this$props7.active,
          data = _this$props7.data,
          onMouseMove = _this$props7.onMouseMove,
          otherProps = (0, _objectWithoutProperties2.default)(_this$props7, _excluded);
      var _this$props$context4 = this.props.context,
          prefixCls = _this$props$context4.prefixCls,
          filterTreeNode = _this$props$context4.filterTreeNode,
          draggable = _this$props$context4.draggable,
          keyEntities = _this$props$context4.keyEntities,
          dropContainerKey = _this$props$context4.dropContainerKey,
          dropTargetKey = _this$props$context4.dropTargetKey;
      var disabled = this.isDisabled();
      var dataOrAriaAttributeProps = (0, _util.getDataAndAria)(otherProps);

      var _ref2 = keyEntities[eventKey] || {},
          level = _ref2.level;

      var isEndNode = isEnd[isEnd.length - 1];
      var mergedDraggable = typeof draggable === 'function' ? draggable(data) : draggable;
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", (0, _extends2.default)({
        ref: domRef,
        className: (0, _classnames.default)(className, "".concat(prefixCls, "-treenode"), (_classNames = {}, (0, _defineProperty2.default)(_classNames, "".concat(prefixCls, "-treenode-disabled"), disabled), (0, _defineProperty2.default)(_classNames, "".concat(prefixCls, "-treenode-switcher-").concat(expanded ? 'open' : 'close'), !isLeaf), (0, _defineProperty2.default)(_classNames, "".concat(prefixCls, "-treenode-checkbox-checked"), checked), (0, _defineProperty2.default)(_classNames, "".concat(prefixCls, "-treenode-checkbox-indeterminate"), halfChecked), (0, _defineProperty2.default)(_classNames, "".concat(prefixCls, "-treenode-selected"), selected), (0, _defineProperty2.default)(_classNames, "".concat(prefixCls, "-treenode-loading"), loading), (0, _defineProperty2.default)(_classNames, "".concat(prefixCls, "-treenode-active"), active), (0, _defineProperty2.default)(_classNames, "".concat(prefixCls, "-treenode-leaf-last"), isEndNode), (0, _defineProperty2.default)(_classNames, 'drop-target', dropTargetKey === eventKey), (0, _defineProperty2.default)(_classNames, 'drop-container', dropContainerKey === eventKey), (0, _defineProperty2.default)(_classNames, 'drag-over', !disabled && dragOver), (0, _defineProperty2.default)(_classNames, 'drag-over-gap-top', !disabled && dragOverGapTop), (0, _defineProperty2.default)(_classNames, 'drag-over-gap-bottom', !disabled && dragOverGapBottom), (0, _defineProperty2.default)(_classNames, 'filter-node', filterTreeNode && filterTreeNode((0, _treeUtil.convertNodePropsToEventData)(this.props))), _classNames)),
        style: style,
        onDragEnter: mergedDraggable ? this.onDragEnter : undefined,
        onDragOver: mergedDraggable ? this.onDragOver : undefined,
        onDragLeave: mergedDraggable ? this.onDragLeave : undefined,
        onDrop: mergedDraggable ? this.onDrop : undefined,
        onDragEnd: mergedDraggable ? this.onDragEnd : undefined,
        onMouseMove: onMouseMove,
        onContextMenu: function onContextMenu(event) {
          var _this2$props;

          event.preventDefault();

          _this2.onRightClick(event, (_this2$props = _this2.props) === null || _this2$props === void 0 ? void 0 : _this2$props.data);
        }
      }, dataOrAriaAttributeProps), /*#__PURE__*/React.createElement(_Indent.default, {
        prefixCls: prefixCls,
        level: level,
        isStart: isStart,
        isEnd: isEnd
      }), this.renderSwitcher(), this.renderCheckbox(), this.renderSelector()), this.state.isNewNodeCreationActive && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
        ref: this.newNodeRef,
        type: "text",
        onKeyDown: function onKeyDown(e) {
          switch (e.key) {
            case enterKey:
              if (typeof _this2.props.handleAddNewFile === 'function') {
                try {
                  var _this2$newNodeRef$cur;

                  _this2.props.handleAddNewFile((_this2$newNodeRef$cur = _this2.newNodeRef.current) === null || _this2$newNodeRef$cur === void 0 ? void 0 : _this2$newNodeRef$cur.value);

                  _this2.setState({
                    isNewNodeCreationActive: false,
                    newNodeCreationError: null
                  });
                } catch (err) {
                  _this2.setState({
                    newNodeCreationError: err.message ? err.message : JSON.stringify(err)
                  });
                }
              }

              break;

            case escapeKey:
              _this2.setState({
                isNewNodeCreationActive: false,
                newNodeCreationError: null
              });

              break;

            default:
              return null;
          }

          return null;
        },
        onMouseDown: function onMouseDown(event) {
          // handle right click to block recursive action triggering.
          if (event.button === 2) {
            event.preventDefault();
          }
        },
        defaultValue: "",
        onFocus: function onFocus() {
          return _this2.setState({
            isInputOnFocus: true
          });
        },
        onBlur: function onBlur() {
          return _this2.setState({
            isInputOnFocus: false
          });
        } // TODO - Improve the styling
        ,
        style: {
          marginLeft: '2.5rem',
          width: '10rem'
        }
      }), this.state.newNodeCreationError && /*#__PURE__*/React.createElement("div", {
        className: "input-error-container new_node-creation-error-container",
        style: {
          position: 'fixed',
          top: ((_this$newNodeRef$curr2 = this.newNodeRef.current) === null || _this$newNodeRef$curr2 === void 0 ? void 0 : (_this$newNodeRef$curr3 = _this$newNodeRef$curr2.getBoundingClientRect()) === null || _this$newNodeRef$curr3 === void 0 ? void 0 : _this$newNodeRef$curr3.top) + 22 || 0,
          left: ((_this$newNodeRef$curr4 = this.newNodeRef.current) === null || _this$newNodeRef$curr4 === void 0 ? void 0 : (_this$newNodeRef$curr5 = _this$newNodeRef$curr4.getBoundingClientRect()) === null || _this$newNodeRef$curr5 === void 0 ? void 0 : _this$newNodeRef$curr5.left) || 0
        }
      }, this.state.newNodeCreationError)));
    }
  }]);
  return InternalTreeNode;
}(React.Component);

exports.InternalTreeNode = InternalTreeNode;

var ContextTreeNode = function ContextTreeNode(props) {
  return /*#__PURE__*/React.createElement(_contextTypes.TreeContext.Consumer, null, function (context) {
    return /*#__PURE__*/React.createElement(InternalTreeNode, (0, _extends2.default)({}, props, {
      context: context
    }));
  });
};

ContextTreeNode.displayName = 'TreeNode';
ContextTreeNode.defaultProps = {
  title: defaultTitle
};
ContextTreeNode.isTreeNode = 1;
var _default = ContextTreeNode;
exports.default = _default;