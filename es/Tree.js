import _extends from "@babel/runtime/helpers/esm/extends";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _createSuper from "@babel/runtime/helpers/esm/createSuper";
// TODO: https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/treeview/treeview-2/treeview-2a.html
// Fully accessibility support
import * as React from 'react';
import KeyCode from "rc-util/es/KeyCode";
import warning from "rc-util/es/warning";
import classNames from 'classnames';
import { TreeContext } from './contextTypes';
import { getDataAndAria, getDragChildrenKeys, parseCheckedKeys, conductExpandParent, calcSelectedKeys, calcDropPosition, arrAdd, arrDel, posToArr } from './util';
import { flattenTreeData, convertTreeToData, convertDataToEntities, warningWithoutKey, convertNodePropsToEventData, getTreeNodeProps, fillFieldNames } from './utils/treeUtil';
import NodeList, { MOTION_KEY, MotionEntity } from './NodeList';
import TreeNode from './TreeNode';
import { conductCheck } from './utils/conductUtil';
import DropIndicator from './DropIndicator';

var Tree = /*#__PURE__*/function (_React$Component) {
  _inherits(Tree, _React$Component);

  var _super = _createSuper(Tree);

  function Tree() {
    var _this;

    _classCallCheck(this, Tree);

    for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
      _args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(_args));
    _this.destroyed = false;
    _this.delayedDragEnterLogic = void 0;
    _this.state = {
      keyEntities: {},
      indent: null,
      selectedKeys: [],
      checkedKeys: [],
      halfCheckedKeys: [],
      loadedKeys: [],
      loadingKeys: [],
      expandedKeys: [],
      dragging: false,
      dragChildrenKeys: [],
      // dropTargetKey is the key of abstract-drop-node
      // the abstract-drop-node is the real drop node when drag and drop
      // not the DOM drag over node
      dropTargetKey: null,
      dropPosition: null,
      dropContainerKey: null,
      dropLevelOffset: null,
      dropTargetPos: null,
      dropAllowed: true,
      // the abstract-drag-over-node
      // if mouse is on the bottom of top dom node or no the top of the bottom dom node
      // abstract-drag-over-node is the top node
      dragOverNodeKey: null,
      treeData: [],
      flattenNodes: [],
      focused: false,
      activeKey: null,
      listChanging: false,
      prevProps: null,
      fieldNames: fillFieldNames()
    };
    _this.dragStartMousePosition = null;
    _this.dragNode = void 0;
    _this.listRef = /*#__PURE__*/React.createRef();

    _this.onNodeDragStart = function (event, node) {
      var _this$state = _this.state,
          expandedKeys = _this$state.expandedKeys,
          keyEntities = _this$state.keyEntities;
      var onDragStart = _this.props.onDragStart;
      var eventKey = node.props.eventKey;
      _this.dragNode = node;
      _this.dragStartMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
      var newExpandedKeys = arrDel(expandedKeys, eventKey);

      _this.setState({
        dragging: true,
        dragChildrenKeys: getDragChildrenKeys(eventKey, keyEntities),
        indent: _this.listRef.current.getIndentWidth()
      });

      _this.setExpandedKeys(newExpandedKeys);

      window.addEventListener('dragend', _this.onWindowDragEnd);

      if (onDragStart) {
        onDragStart({
          event: event,
          node: convertNodePropsToEventData(node.props)
        });
      }
    };

    _this.onNodeDragEnter = function (event, node) {
      var _this$state2 = _this.state,
          expandedKeys = _this$state2.expandedKeys,
          keyEntities = _this$state2.keyEntities,
          dragChildrenKeys = _this$state2.dragChildrenKeys,
          flattenNodes = _this$state2.flattenNodes,
          indent = _this$state2.indent;
      var _this$props = _this.props,
          onDragEnter = _this$props.onDragEnter,
          onExpand = _this$props.onExpand,
          allowDrop = _this$props.allowDrop,
          direction = _this$props.direction;
      var pos = node.props.pos;

      var _assertThisInitialize = _assertThisInitialized(_this),
          dragNode = _assertThisInitialize.dragNode;

      var _calcDropPosition = calcDropPosition(event, dragNode, node, indent, _this.dragStartMousePosition, allowDrop, flattenNodes, keyEntities, expandedKeys, direction),
          dropPosition = _calcDropPosition.dropPosition,
          dropLevelOffset = _calcDropPosition.dropLevelOffset,
          dropTargetKey = _calcDropPosition.dropTargetKey,
          dropContainerKey = _calcDropPosition.dropContainerKey,
          dropTargetPos = _calcDropPosition.dropTargetPos,
          dropAllowed = _calcDropPosition.dropAllowed,
          dragOverNodeKey = _calcDropPosition.dragOverNodeKey;

      if (!dragNode || // don't allow drop inside its children
      dragChildrenKeys.indexOf(dropTargetKey) !== -1 || // don't allow drop when drop is not allowed caculated by calcDropPosition
      !dropAllowed) {
        _this.setState({
          dragOverNodeKey: null,
          dropPosition: null,
          dropLevelOffset: null,
          dropTargetKey: null,
          dropContainerKey: null,
          dropTargetPos: null,
          dropAllowed: false
        });

        return;
      } // Side effect for delay drag


      if (!_this.delayedDragEnterLogic) {
        _this.delayedDragEnterLogic = {};
      }

      Object.keys(_this.delayedDragEnterLogic).forEach(function (key) {
        clearTimeout(_this.delayedDragEnterLogic[key]);
      });

      if (dragNode.props.eventKey !== node.props.eventKey) {
        // hoist expand logic here
        // since if logic is on the bottom
        // it will be blocked by abstract dragover node check
        //   => if you dragenter from top, you mouse will still be consider as in the top node
        event.persist();
        _this.delayedDragEnterLogic[pos] = window.setTimeout(function () {
          if (!_this.state.dragging) return;

          var newExpandedKeys = _toConsumableArray(expandedKeys);

          var entity = keyEntities[node.props.eventKey];

          if (entity && (entity.children || []).length) {
            newExpandedKeys = arrAdd(expandedKeys, node.props.eventKey);
          }

          if (!('expandedKeys' in _this.props)) {
            _this.setExpandedKeys(newExpandedKeys);
          }

          if (onExpand) {
            onExpand(newExpandedKeys, {
              node: convertNodePropsToEventData(node.props),
              expanded: true,
              nativeEvent: event.nativeEvent
            });
          }
        }, 800);
      } // Skip if drag node is self


      if (dragNode.props.eventKey === dropTargetKey && dropLevelOffset === 0) {
        _this.setState({
          dragOverNodeKey: null,
          dropPosition: null,
          dropLevelOffset: null,
          dropTargetKey: null,
          dropContainerKey: null,
          dropTargetPos: null,
          dropAllowed: false
        });

        return;
      } // Update drag over node and drag state


      _this.setState({
        dragOverNodeKey: dragOverNodeKey,
        dropPosition: dropPosition,
        dropLevelOffset: dropLevelOffset,
        dropTargetKey: dropTargetKey,
        dropContainerKey: dropContainerKey,
        dropTargetPos: dropTargetPos,
        dropAllowed: dropAllowed
      });

      if (onDragEnter) {
        onDragEnter({
          event: event,
          node: convertNodePropsToEventData(node.props),
          expandedKeys: expandedKeys
        });
      }
    };

    _this.onNodeDragOver = function (event, node) {
      var _this$state3 = _this.state,
          dragChildrenKeys = _this$state3.dragChildrenKeys,
          flattenNodes = _this$state3.flattenNodes,
          keyEntities = _this$state3.keyEntities,
          expandedKeys = _this$state3.expandedKeys,
          indent = _this$state3.indent;
      var _this$props2 = _this.props,
          onDragOver = _this$props2.onDragOver,
          allowDrop = _this$props2.allowDrop,
          direction = _this$props2.direction;

      var _assertThisInitialize2 = _assertThisInitialized(_this),
          dragNode = _assertThisInitialize2.dragNode;

      var _calcDropPosition2 = calcDropPosition(event, dragNode, node, indent, _this.dragStartMousePosition, allowDrop, flattenNodes, keyEntities, expandedKeys, direction),
          dropPosition = _calcDropPosition2.dropPosition,
          dropLevelOffset = _calcDropPosition2.dropLevelOffset,
          dropTargetKey = _calcDropPosition2.dropTargetKey,
          dropContainerKey = _calcDropPosition2.dropContainerKey,
          dropAllowed = _calcDropPosition2.dropAllowed,
          dropTargetPos = _calcDropPosition2.dropTargetPos,
          dragOverNodeKey = _calcDropPosition2.dragOverNodeKey;

      if (!dragNode || dragChildrenKeys.indexOf(dropTargetKey) !== -1 || !dropAllowed) {
        // don't allow drop inside its children
        // don't allow drop when drop is not allowed caculated by calcDropPosition
        return;
      } // Update drag position


      if (dragNode.props.eventKey === dropTargetKey && dropLevelOffset === 0) {
        if (!(_this.state.dropPosition === null && _this.state.dropLevelOffset === null && _this.state.dropTargetKey === null && _this.state.dropContainerKey === null && _this.state.dropTargetPos === null && _this.state.dropAllowed === false && _this.state.dragOverNodeKey === null)) {
          _this.setState({
            dropPosition: null,
            dropLevelOffset: null,
            dropTargetKey: null,
            dropContainerKey: null,
            dropTargetPos: null,
            dropAllowed: false,
            dragOverNodeKey: null
          });
        }
      } else if (!(dropPosition === _this.state.dropPosition && dropLevelOffset === _this.state.dropLevelOffset && dropTargetKey === _this.state.dropTargetKey && dropContainerKey === _this.state.dropContainerKey && dropTargetPos === _this.state.dropTargetPos && dropAllowed === _this.state.dropAllowed && dragOverNodeKey === _this.state.dragOverNodeKey)) {
        _this.setState({
          dropPosition: dropPosition,
          dropLevelOffset: dropLevelOffset,
          dropTargetKey: dropTargetKey,
          dropContainerKey: dropContainerKey,
          dropTargetPos: dropTargetPos,
          dropAllowed: dropAllowed,
          dragOverNodeKey: dragOverNodeKey
        });
      }

      if (onDragOver) {
        onDragOver({
          event: event,
          node: convertNodePropsToEventData(node.props)
        });
      }
    };

    _this.onNodeDragLeave = function (event, node) {
      var onDragLeave = _this.props.onDragLeave;

      if (onDragLeave) {
        onDragLeave({
          event: event,
          node: convertNodePropsToEventData(node.props)
        });
      }
    };

    _this.onWindowDragEnd = function (event) {
      _this.onNodeDragEnd(event, null, true);

      window.removeEventListener('dragend', _this.onWindowDragEnd);
    };

    _this.onNodeDragEnd = function (event, node) {
      var outsideTree = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var onDragEnd = _this.props.onDragEnd;

      _this.setState({
        dragOverNodeKey: null
      });

      _this.cleanDragState();

      if (onDragEnd && !outsideTree) {
        onDragEnd({
          event: event,
          node: convertNodePropsToEventData(node.props)
        });
      }

      _this.dragNode = null;
    };

    _this.onNodeDrop = function (event, node) {
      var _this$getActiveItem;

      var outsideTree = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var _this$state4 = _this.state,
          dragChildrenKeys = _this$state4.dragChildrenKeys,
          dropPosition = _this$state4.dropPosition,
          dropTargetKey = _this$state4.dropTargetKey,
          dropTargetPos = _this$state4.dropTargetPos,
          dropAllowed = _this$state4.dropAllowed;
      if (!dropAllowed) return;
      var onDrop = _this.props.onDrop;

      _this.setState({
        dragOverNodeKey: null
      });

      _this.cleanDragState();

      if (dropTargetKey === null) return;

      var abstractDropNodeProps = _objectSpread(_objectSpread({}, getTreeNodeProps(dropTargetKey, _this.getTreeNodeRequiredProps())), {}, {
        active: ((_this$getActiveItem = _this.getActiveItem()) === null || _this$getActiveItem === void 0 ? void 0 : _this$getActiveItem.data.key) === dropTargetKey,
        data: _this.state.keyEntities[dropTargetKey].node
      });

      var dropToChild = dragChildrenKeys.indexOf(dropTargetKey) !== -1;
      warning(!dropToChild, "Can not drop to dragNode's children node. This is a bug of rc-tree. Please report an issue.");
      var posArr = posToArr(dropTargetPos);
      var dropResult = {
        event: event,
        node: convertNodePropsToEventData(abstractDropNodeProps),
        dragNode: _this.dragNode ? convertNodePropsToEventData(_this.dragNode.props) : null,
        dragNodesKeys: [_this.dragNode.props.eventKey].concat(dragChildrenKeys),
        dropToGap: dropPosition !== 0,
        dropPosition: dropPosition + Number(posArr[posArr.length - 1])
      };

      if (onDrop && !outsideTree) {
        onDrop(dropResult);
      }

      _this.dragNode = null;
    };

    _this.cleanDragState = function () {
      var dragging = _this.state.dragging;

      if (dragging) {
        _this.setState({
          dragging: false,
          dropPosition: null,
          dropContainerKey: null,
          dropTargetKey: null,
          dropLevelOffset: null,
          dropAllowed: true,
          dragOverNodeKey: null
        });
      }

      _this.dragStartMousePosition = null;
    };

    _this.onNodeClick = function (e, treeNode) {
      var onClick = _this.props.onClick;

      if (onClick) {
        onClick(e, treeNode);
      }
    };

    _this.onNodeDoubleClick = function (e, treeNode) {
      var onDoubleClick = _this.props.onDoubleClick;

      if (onDoubleClick) {
        onDoubleClick(e, treeNode);
      }
    };

    _this.onNodeSelect = function (e, treeNode) {
      var selectedKeys = _this.state.selectedKeys;
      var _this$state5 = _this.state,
          keyEntities = _this$state5.keyEntities,
          fieldNames = _this$state5.fieldNames;
      var _this$props3 = _this.props,
          onSelect = _this$props3.onSelect,
          multiple = _this$props3.multiple;
      var selected = treeNode.selected;
      var key = treeNode[fieldNames.key];
      var targetSelected = !selected; // Update selected keys

      if (!targetSelected) {
        selectedKeys = arrDel(selectedKeys, key);
      } else if (!multiple) {
        selectedKeys = [key];
      } else {
        selectedKeys = arrAdd(selectedKeys, key);
      } // [Legacy] Not found related usage in doc or upper libs


      var selectedNodes = selectedKeys.map(function (selectedKey) {
        var entity = keyEntities[selectedKey];
        if (!entity) return null;
        return entity.node;
      }).filter(function (node) {
        return node;
      });

      _this.setUncontrolledState({
        selectedKeys: selectedKeys
      });

      if (onSelect) {
        onSelect(selectedKeys, {
          event: 'select',
          selected: targetSelected,
          node: treeNode,
          selectedNodes: selectedNodes,
          nativeEvent: e.nativeEvent
        });
      }
    };

    _this.onNodeCheck = function (e, treeNode, checked) {
      var _this$state6 = _this.state,
          keyEntities = _this$state6.keyEntities,
          oriCheckedKeys = _this$state6.checkedKeys,
          oriHalfCheckedKeys = _this$state6.halfCheckedKeys;
      var _this$props4 = _this.props,
          checkStrictly = _this$props4.checkStrictly,
          onCheck = _this$props4.onCheck;
      var key = treeNode.key; // Prepare trigger arguments

      var checkedObj;
      var eventObj = {
        event: 'check',
        node: treeNode,
        checked: checked,
        nativeEvent: e.nativeEvent
      };

      if (checkStrictly) {
        var checkedKeys = checked ? arrAdd(oriCheckedKeys, key) : arrDel(oriCheckedKeys, key);
        var halfCheckedKeys = arrDel(oriHalfCheckedKeys, key);
        checkedObj = {
          checked: checkedKeys,
          halfChecked: halfCheckedKeys
        };
        eventObj.checkedNodes = checkedKeys.map(function (checkedKey) {
          return keyEntities[checkedKey];
        }).filter(function (entity) {
          return entity;
        }).map(function (entity) {
          return entity.node;
        });

        _this.setUncontrolledState({
          checkedKeys: checkedKeys
        });
      } else {
        // Always fill first
        var _conductCheck = conductCheck([].concat(_toConsumableArray(oriCheckedKeys), [key]), true, keyEntities),
            _checkedKeys = _conductCheck.checkedKeys,
            _halfCheckedKeys = _conductCheck.halfCheckedKeys; // If remove, we do it again to correction


        if (!checked) {
          var keySet = new Set(_checkedKeys);
          keySet.delete(key);

          var _conductCheck2 = conductCheck(Array.from(keySet), {
            checked: false,
            halfCheckedKeys: _halfCheckedKeys
          }, keyEntities);

          _checkedKeys = _conductCheck2.checkedKeys;
          _halfCheckedKeys = _conductCheck2.halfCheckedKeys;
        }

        checkedObj = _checkedKeys; // [Legacy] This is used for `rc-tree-select`

        eventObj.checkedNodes = [];
        eventObj.checkedNodesPositions = [];
        eventObj.halfCheckedKeys = _halfCheckedKeys;

        _checkedKeys.forEach(function (checkedKey) {
          var entity = keyEntities[checkedKey];
          if (!entity) return;
          var node = entity.node,
              pos = entity.pos;
          eventObj.checkedNodes.push(node);
          eventObj.checkedNodesPositions.push({
            node: node,
            pos: pos
          });
        });

        _this.setUncontrolledState({
          checkedKeys: _checkedKeys
        }, false, {
          halfCheckedKeys: _halfCheckedKeys
        });
      }

      if (onCheck) {
        onCheck(checkedObj, eventObj);
      }
    };

    _this.onNodeLoad = function (treeNode) {
      return new Promise(function (resolve, reject) {
        // We need to get the latest state of loading/loaded keys
        _this.setState(function (_ref) {
          var _ref$loadedKeys = _ref.loadedKeys,
              loadedKeys = _ref$loadedKeys === void 0 ? [] : _ref$loadedKeys,
              _ref$loadingKeys = _ref.loadingKeys,
              loadingKeys = _ref$loadingKeys === void 0 ? [] : _ref$loadingKeys;
          var _this$props5 = _this.props,
              loadData = _this$props5.loadData,
              onLoad = _this$props5.onLoad;
          var key = treeNode.key;

          if (!loadData || loadedKeys.indexOf(key) !== -1 || loadingKeys.indexOf(key) !== -1) {
            return null;
          } // Process load data


          var promise = loadData(treeNode);
          promise.then(function () {
            var _this$state7 = _this.state,
                currentLoadedKeys = _this$state7.loadedKeys,
                currentLoadingKeys = _this$state7.loadingKeys;
            var newLoadedKeys = arrAdd(currentLoadedKeys, key);
            var newLoadingKeys = arrDel(currentLoadingKeys, key); // onLoad should trigger before internal setState to avoid `loadData` trigger twice.
            // https://github.com/ant-design/ant-design/issues/12464

            if (onLoad) {
              onLoad(newLoadedKeys, {
                event: 'load',
                node: treeNode
              });
            }

            _this.setUncontrolledState({
              loadedKeys: newLoadedKeys
            });

            _this.setState({
              loadingKeys: newLoadingKeys
            });

            resolve();
          }).catch(function (e) {
            var currentLoadingKeys = _this.state.loadingKeys;
            var newLoadingKeys = arrDel(currentLoadingKeys, key);

            _this.setState({
              loadingKeys: newLoadingKeys
            });

            reject(e);
          });
          return {
            loadingKeys: arrAdd(loadingKeys, key)
          };
        });
      });
    };

    _this.onNodeMouseEnter = function (event, node) {
      var onMouseEnter = _this.props.onMouseEnter;

      if (onMouseEnter) {
        onMouseEnter({
          event: event,
          node: node
        });
      }
    };

    _this.onNodeMouseLeave = function (event, node) {
      var onMouseLeave = _this.props.onMouseLeave;

      if (onMouseLeave) {
        onMouseLeave({
          event: event,
          node: node
        });
      }
    };

    _this.onNodeContextMenu = function (event, node) {
      var onRightClick = _this.props.onRightClick;

      if (onRightClick) {
        event.preventDefault();
        onRightClick({
          event: event,
          node: node
        });
      }
    };

    _this.onFocus = function () {
      var onFocus = _this.props.onFocus;

      _this.setState({
        focused: true
      });

      if (onFocus) {
        onFocus.apply(void 0, arguments);
      }
    };

    _this.onBlur = function () {
      var onBlur = _this.props.onBlur;

      _this.setState({
        focused: false
      });

      _this.onActiveChange(null);

      if (onBlur) {
        onBlur.apply(void 0, arguments);
      }
    };

    _this.getTreeNodeRequiredProps = function () {
      var _this$state8 = _this.state,
          expandedKeys = _this$state8.expandedKeys,
          selectedKeys = _this$state8.selectedKeys,
          loadedKeys = _this$state8.loadedKeys,
          loadingKeys = _this$state8.loadingKeys,
          checkedKeys = _this$state8.checkedKeys,
          halfCheckedKeys = _this$state8.halfCheckedKeys,
          dragOverNodeKey = _this$state8.dragOverNodeKey,
          dropPosition = _this$state8.dropPosition,
          keyEntities = _this$state8.keyEntities;
      return {
        expandedKeys: expandedKeys || [],
        selectedKeys: selectedKeys || [],
        loadedKeys: loadedKeys || [],
        loadingKeys: loadingKeys || [],
        checkedKeys: checkedKeys || [],
        halfCheckedKeys: halfCheckedKeys || [],
        dragOverNodeKey: dragOverNodeKey,
        dropPosition: dropPosition,
        keyEntities: keyEntities
      };
    };

    _this.setExpandedKeys = function (expandedKeys) {
      var _this$state9 = _this.state,
          treeData = _this$state9.treeData,
          fieldNames = _this$state9.fieldNames;
      var flattenNodes = flattenTreeData(treeData, expandedKeys, fieldNames);

      _this.setUncontrolledState({
        expandedKeys: expandedKeys,
        flattenNodes: flattenNodes
      }, true);
    };

    _this.onNodeExpand = function (e, treeNode) {
      var expandedKeys = _this.state.expandedKeys;
      var _this$state10 = _this.state,
          listChanging = _this$state10.listChanging,
          fieldNames = _this$state10.fieldNames;
      var _this$props6 = _this.props,
          onExpand = _this$props6.onExpand,
          loadData = _this$props6.loadData;
      var expanded = treeNode.expanded;
      var key = treeNode[fieldNames.key]; // Do nothing when motion is in progress

      if (listChanging) {
        return;
      } // Update selected keys


      var index = expandedKeys.indexOf(key);
      var targetExpanded = !expanded;
      warning(expanded && index !== -1 || !expanded && index === -1, 'Expand state not sync with index check');

      if (targetExpanded) {
        expandedKeys = arrAdd(expandedKeys, key);
      } else {
        expandedKeys = arrDel(expandedKeys, key);
      }

      _this.setExpandedKeys(expandedKeys);

      if (onExpand) {
        onExpand(expandedKeys, {
          node: treeNode,
          expanded: targetExpanded,
          nativeEvent: e.nativeEvent
        });
      } // Async Load data


      if (targetExpanded && loadData) {
        var loadPromise = _this.onNodeLoad(treeNode);

        if (loadPromise) {
          loadPromise.then(function () {
            // [Legacy] Refresh logic
            var newFlattenTreeData = flattenTreeData(_this.state.treeData, expandedKeys, fieldNames);

            _this.setUncontrolledState({
              flattenNodes: newFlattenTreeData
            });
          }).catch(function () {
            var currentExpandedKeys = _this.state.expandedKeys;
            var expandedKeysToRestore = arrDel(currentExpandedKeys, key);

            _this.setExpandedKeys(expandedKeysToRestore);
          });
        }
      }
    };

    _this.onListChangeStart = function () {
      _this.setUncontrolledState({
        listChanging: true
      });
    };

    _this.onListChangeEnd = function () {
      setTimeout(function () {
        _this.setUncontrolledState({
          listChanging: false
        });
      });
    };

    _this.onActiveChange = function (newActiveKey) {
      var activeKey = _this.state.activeKey;
      var onActiveChange = _this.props.onActiveChange;

      if (activeKey === newActiveKey) {
        return;
      }

      _this.setState({
        activeKey: newActiveKey
      });

      if (newActiveKey !== null) {
        _this.scrollTo({
          key: newActiveKey
        });
      }

      if (onActiveChange) {
        onActiveChange(newActiveKey);
      }
    };

    _this.getActiveItem = function () {
      var _this$state11 = _this.state,
          activeKey = _this$state11.activeKey,
          flattenNodes = _this$state11.flattenNodes;

      if (activeKey === null) {
        return null;
      }

      return flattenNodes.find(function (_ref2) {
        var key = _ref2.data.key;
        return key === activeKey;
      }) || null;
    };

    _this.offsetActiveKey = function (offset) {
      var _this$state12 = _this.state,
          flattenNodes = _this$state12.flattenNodes,
          activeKey = _this$state12.activeKey;
      var index = flattenNodes.findIndex(function (_ref3) {
        var key = _ref3.data.key;
        return key === activeKey;
      }); // Align with index

      if (index === -1 && offset < 0) {
        index = flattenNodes.length;
      }

      index = (index + offset + flattenNodes.length) % flattenNodes.length;
      var item = flattenNodes[index];

      if (item) {
        var key = item.data.key;

        _this.onActiveChange(key);
      } else {
        _this.onActiveChange(null);
      }
    };

    _this.onKeyDown = function (event) {
      var _this$state13 = _this.state,
          activeKey = _this$state13.activeKey,
          expandedKeys = _this$state13.expandedKeys,
          checkedKeys = _this$state13.checkedKeys;
      var _this$props7 = _this.props,
          onKeyDown = _this$props7.onKeyDown,
          checkable = _this$props7.checkable,
          selectable = _this$props7.selectable; // >>>>>>>>>> Direction

      switch (event.which) {
        case KeyCode.UP:
          {
            _this.offsetActiveKey(-1);

            event.preventDefault();
            break;
          }

        case KeyCode.DOWN:
          {
            _this.offsetActiveKey(1);

            event.preventDefault();
            break;
          }
      } // >>>>>>>>>> Expand & Selection


      var activeItem = _this.getActiveItem();

      if (activeItem && activeItem.data) {
        var treeNodeRequiredProps = _this.getTreeNodeRequiredProps();

        var expandable = activeItem.data.isLeaf === false || !!(activeItem.data.children || []).length;
        var eventNode = convertNodePropsToEventData(_objectSpread(_objectSpread({}, getTreeNodeProps(activeKey, treeNodeRequiredProps)), {}, {
          data: activeItem.data,
          active: true
        }));

        switch (event.which) {
          // >>> Expand
          case KeyCode.LEFT:
            {
              // Collapse if possible
              if (expandable && expandedKeys.includes(activeKey)) {
                _this.onNodeExpand({}, eventNode);
              } else if (activeItem.parent) {
                _this.onActiveChange(activeItem.parent.data.key);
              }

              event.preventDefault();
              break;
            }

          case KeyCode.RIGHT:
            {
              // Expand if possible
              if (expandable && !expandedKeys.includes(activeKey)) {
                _this.onNodeExpand({}, eventNode);
              } else if (activeItem.children && activeItem.children.length) {
                _this.onActiveChange(activeItem.children[0].data.key);
              }

              event.preventDefault();
              break;
            }
          // Selection

          case KeyCode.ENTER:
          case KeyCode.SPACE:
            {
              if (checkable && !eventNode.disabled && eventNode.checkable !== false && !eventNode.disableCheckbox) {
                _this.onNodeCheck({}, eventNode, !checkedKeys.includes(activeKey));
              } else if (!checkable && selectable && !eventNode.disabled && eventNode.selectable !== false) {
                _this.onNodeSelect({}, eventNode);
              }

              break;
            }
        }
      }

      if (onKeyDown) {
        onKeyDown(event);
      }
    };

    _this.setUncontrolledState = function (state) {
      var atomic = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var forceState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (_this.destroyed) {
        return;
      }

      var needSync = false;
      var allPassed = true;
      var newState = {};
      Object.keys(state).forEach(function (name) {
        if (name in _this.props) {
          allPassed = false;
          return;
        }

        needSync = true;
        newState[name] = state[name];
      });

      if (needSync && (!atomic || allPassed)) {
        _this.setState(_objectSpread(_objectSpread({}, newState), forceState));
      }
    };

    _this.scrollTo = function (scroll) {
      _this.listRef.current.scrollTo(scroll);
    };

    return _this;
  }

  _createClass(Tree, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener('dragend', this.onWindowDragEnd);
      this.destroyed = true;
    }
  }, {
    key: "render",
    value: function render() {
      var _classNames;

      var _this$state14 = this.state,
          focused = _this$state14.focused,
          flattenNodes = _this$state14.flattenNodes,
          keyEntities = _this$state14.keyEntities,
          dragging = _this$state14.dragging,
          activeKey = _this$state14.activeKey,
          dropLevelOffset = _this$state14.dropLevelOffset,
          dropContainerKey = _this$state14.dropContainerKey,
          dropTargetKey = _this$state14.dropTargetKey,
          dropPosition = _this$state14.dropPosition,
          dragOverNodeKey = _this$state14.dragOverNodeKey,
          indent = _this$state14.indent;
      var _this$props8 = this.props,
          prefixCls = _this$props8.prefixCls,
          className = _this$props8.className,
          style = _this$props8.style,
          showLine = _this$props8.showLine,
          focusable = _this$props8.focusable,
          _this$props8$tabIndex = _this$props8.tabIndex,
          tabIndex = _this$props8$tabIndex === void 0 ? 0 : _this$props8$tabIndex,
          selectable = _this$props8.selectable,
          showIcon = _this$props8.showIcon,
          icon = _this$props8.icon,
          switcherIcon = _this$props8.switcherIcon,
          draggable = _this$props8.draggable,
          checkable = _this$props8.checkable,
          checkStrictly = _this$props8.checkStrictly,
          disabled = _this$props8.disabled,
          motion = _this$props8.motion,
          loadData = _this$props8.loadData,
          filterTreeNode = _this$props8.filterTreeNode,
          height = _this$props8.height,
          itemHeight = _this$props8.itemHeight,
          virtual = _this$props8.virtual,
          titleRender = _this$props8.titleRender,
          dropIndicatorRender = _this$props8.dropIndicatorRender,
          onContextMenu = _this$props8.onContextMenu,
          onScroll = _this$props8.onScroll,
          direction = _this$props8.direction;
      var domProps = getDataAndAria(this.props);
      return /*#__PURE__*/React.createElement(TreeContext.Provider, {
        value: {
          prefixCls: prefixCls,
          selectable: selectable,
          showIcon: showIcon,
          icon: icon,
          switcherIcon: switcherIcon,
          draggable: draggable,
          checkable: checkable,
          checkStrictly: checkStrictly,
          disabled: disabled,
          keyEntities: keyEntities,
          dropLevelOffset: dropLevelOffset,
          dropContainerKey: dropContainerKey,
          dropTargetKey: dropTargetKey,
          dropPosition: dropPosition,
          dragOverNodeKey: dragOverNodeKey,
          indent: indent,
          direction: direction,
          dropIndicatorRender: dropIndicatorRender,
          loadData: loadData,
          filterTreeNode: filterTreeNode,
          titleRender: titleRender,
          onNodeClick: this.onNodeClick,
          onNodeDoubleClick: this.onNodeDoubleClick,
          onNodeExpand: this.onNodeExpand,
          onNodeSelect: this.onNodeSelect,
          onNodeCheck: this.onNodeCheck,
          onNodeLoad: this.onNodeLoad,
          onNodeMouseEnter: this.onNodeMouseEnter,
          onNodeMouseLeave: this.onNodeMouseLeave,
          onNodeContextMenu: this.onNodeContextMenu,
          onNodeDragStart: this.onNodeDragStart,
          onNodeDragEnter: this.onNodeDragEnter,
          onNodeDragOver: this.onNodeDragOver,
          onNodeDragLeave: this.onNodeDragLeave,
          onNodeDragEnd: this.onNodeDragEnd,
          onNodeDrop: this.onNodeDrop
        }
      }, /*#__PURE__*/React.createElement("div", {
        role: "tree",
        className: classNames(prefixCls, className, (_classNames = {}, _defineProperty(_classNames, "".concat(prefixCls, "-show-line"), showLine), _defineProperty(_classNames, "".concat(prefixCls, "-focused"), focused), _defineProperty(_classNames, "".concat(prefixCls, "-active-focused"), activeKey !== null), _classNames))
      }, /*#__PURE__*/React.createElement(NodeList, _extends({
        ref: this.listRef,
        prefixCls: prefixCls,
        style: style,
        data: flattenNodes,
        disabled: disabled,
        selectable: selectable,
        checkable: !!checkable,
        motion: motion,
        dragging: dragging,
        height: height,
        itemHeight: itemHeight,
        virtual: virtual,
        focusable: focusable,
        focused: focused,
        tabIndex: tabIndex,
        activeItem: this.getActiveItem(),
        onFocus: this.onFocus,
        onBlur: this.onBlur,
        onKeyDown: this.onKeyDown,
        onActiveChange: this.onActiveChange,
        onListChangeStart: this.onListChangeStart,
        onListChangeEnd: this.onListChangeEnd,
        onContextMenu: onContextMenu,
        onScroll: onScroll
      }, this.getTreeNodeRequiredProps(), domProps, {
        handleChildDel: this.props.handleChildDel,
        handleNodeRename: this.props.handleNodeRename,
        handleAddNewFile: this.props.handleAddNewFile,
        handleUploadNodeData: this.props.handleUploadNodeData
      }))));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(props, prevState) {
      var prevProps = prevState.prevProps;
      var newState = {
        prevProps: props
      };

      function needSync(name) {
        return !prevProps && name in props || prevProps && prevProps[name] !== props[name];
      } // ================== Tree Node ==================


      var treeData; // fieldNames

      var fieldNames = prevState.fieldNames;

      if (needSync('fieldNames')) {
        fieldNames = fillFieldNames(props.fieldNames);
        newState.fieldNames = fieldNames;
      } // Check if `treeData` or `children` changed and save into the state.


      if (needSync('treeData')) {
        treeData = props.treeData;
      } else if (needSync('children')) {
        warning(false, '`children` of Tree is deprecated. Please use `treeData` instead.');
        treeData = convertTreeToData(props.children);
      } // Save flatten nodes info and convert `treeData` into keyEntities


      if (treeData) {
        newState.treeData = treeData;
        var entitiesMap = convertDataToEntities(treeData, {
          fieldNames: fieldNames
        });
        newState.keyEntities = _objectSpread(_defineProperty({}, MOTION_KEY, MotionEntity), entitiesMap.keyEntities); // Warning if treeNode not provide key

        if (process.env.NODE_ENV !== 'production') {
          warningWithoutKey(treeData, fieldNames);
        }
      }

      var keyEntities = newState.keyEntities || prevState.keyEntities; // ================ expandedKeys =================

      if (needSync('expandedKeys') || prevProps && needSync('autoExpandParent')) {
        newState.expandedKeys = props.autoExpandParent || !prevProps && props.defaultExpandParent ? conductExpandParent(props.expandedKeys, keyEntities) : props.expandedKeys;
      } else if (!prevProps && props.defaultExpandAll) {
        var cloneKeyEntities = _objectSpread({}, keyEntities);

        delete cloneKeyEntities[MOTION_KEY];
        newState.expandedKeys = Object.keys(cloneKeyEntities).map(function (key) {
          return cloneKeyEntities[key].key;
        });
      } else if (!prevProps && props.defaultExpandedKeys) {
        newState.expandedKeys = props.autoExpandParent || props.defaultExpandParent ? conductExpandParent(props.defaultExpandedKeys, keyEntities) : props.defaultExpandedKeys;
      }

      if (!newState.expandedKeys) {
        delete newState.expandedKeys;
      } // ================ flattenNodes =================


      if (treeData || newState.expandedKeys) {
        var flattenNodes = flattenTreeData(treeData || prevState.treeData, newState.expandedKeys || prevState.expandedKeys, fieldNames);
        newState.flattenNodes = flattenNodes;
      } // ================ selectedKeys =================


      if (props.selectable) {
        if (needSync('selectedKeys')) {
          newState.selectedKeys = calcSelectedKeys(props.selectedKeys, props);
        } else if (!prevProps && props.defaultSelectedKeys) {
          newState.selectedKeys = calcSelectedKeys(props.defaultSelectedKeys, props);
        }
      } // ================= checkedKeys =================


      if (props.checkable) {
        var checkedKeyEntity;

        if (needSync('checkedKeys')) {
          checkedKeyEntity = parseCheckedKeys(props.checkedKeys) || {};
        } else if (!prevProps && props.defaultCheckedKeys) {
          checkedKeyEntity = parseCheckedKeys(props.defaultCheckedKeys) || {};
        } else if (treeData) {
          // If `treeData` changed, we also need check it
          checkedKeyEntity = parseCheckedKeys(props.checkedKeys) || {
            checkedKeys: prevState.checkedKeys,
            halfCheckedKeys: prevState.halfCheckedKeys
          };
        }

        if (checkedKeyEntity) {
          var _checkedKeyEntity = checkedKeyEntity,
              _checkedKeyEntity$che = _checkedKeyEntity.checkedKeys,
              checkedKeys = _checkedKeyEntity$che === void 0 ? [] : _checkedKeyEntity$che,
              _checkedKeyEntity$hal = _checkedKeyEntity.halfCheckedKeys,
              halfCheckedKeys = _checkedKeyEntity$hal === void 0 ? [] : _checkedKeyEntity$hal;

          if (!props.checkStrictly) {
            var conductKeys = conductCheck(checkedKeys, true, keyEntities);
            checkedKeys = conductKeys.checkedKeys;
            halfCheckedKeys = conductKeys.halfCheckedKeys;
          }

          newState.checkedKeys = checkedKeys;
          newState.halfCheckedKeys = halfCheckedKeys;
        }
      } // ================= loadedKeys ==================


      if (needSync('loadedKeys')) {
        newState.loadedKeys = props.loadedKeys;
      }

      return newState;
    }
  }]);

  return Tree;
}(React.Component);

Tree.defaultProps = {
  prefixCls: 'rc-tree',
  showLine: false,
  showIcon: true,
  selectable: true,
  multiple: false,
  checkable: false,
  disabled: false,
  checkStrictly: false,
  draggable: false,
  defaultExpandParent: true,
  autoExpandParent: false,
  defaultExpandAll: false,
  defaultExpandedKeys: [],
  defaultCheckedKeys: [],
  defaultSelectedKeys: [],
  dropIndicatorRender: DropIndicator,
  allowDrop: function allowDrop() {
    return true;
  }
};
Tree.TreeNode = TreeNode;
export default Tree;