/* eslint-disable */
/* eslint-disable no-alert, no-console, react/no-find-dom-node */
import React from 'react';
import Tree, { TreeNode } from 'rc-tree';
import { ListGroup, ButtonGroup, Button } from 'react-bootstrap'
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip'
import '../../assets/index.less';
import './basic.less';
// import './basic.scss';
// import '../index.scss';

const treeDataDummy = [
  {
    key: 'parent 1',
    title: 'parent 1',
    isLeaf: false,
    contextMenu: [
      {
        label: 'Add',
        value: 'addNewNode',
      },
      {
        label: 'Upload',
        value: 'uploadNodeData',
      },
    ],
    children: [
      {
        key: 'parent-1/parent 1-1-0', title: 'parent 1-1-0', contextMenu: [
          {
            label: 'Rename',
            value: 'renameNode',
          },
          {
            label: 'Delete',
            value: 'deleteNode',
          },
        ],
      },
      {
        key: 'parent-1/parent 1-2-0', title: 'parent 1-2-0', contextMenu: [
          {
            label: 'Rename',
            value: 'renameNode',
          },
          {
            label: 'Delete',
            value: 'deleteNode',
          },
        ],
      },
    ],
  },
  {
    key: '0-0-1',
    title: 'parent 1-2',
    children: [
      { key: '0-0-1-0', title: 'parent 1-2-0', disableCheckbox: true },
      {
        key: '0-0-1-1', title: 'parent 1-2-1',
      },
    ],
  },
];

class RcTreeBasic extends React.Component {
  static defaultProps = {
    keys: ['0-0-0-0'],
  };

  constructor(props) {
    super(props);
    const { keys } = props;
    this.state = {
      defaultExpandedKeys: keys,
      defaultSelectedKeys: keys,
      defaultCheckedKeys: keys,
      treeDataState: treeDataDummy
    };

    this.treeRef = React.createRef();
  }
  componentDidMount() {
    this.getContainer();
  }

  componentWillUnmount() {
    if (this.cmContainer) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      document.body.removeChild(this.cmContainer);
      this.cmContainer = null;
    }
  }
  onRightClick = info => {
  };

  getContainer() {
    if (!this.cmContainer) {
      this.cmContainer = document.createElement('div');
      document.body.appendChild(this.cmContainer);
    }
    return this.cmContainer;
  }

  renderCm(info) {
    if (this.toolTip) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      this.toolTip = null;
    }
    this.toolTip = (
      <Tooltip
        id="overlay-example"
        trigger="click"
        placement="bottomLeft"
        prefixCls="rc-tree-contextmenu"
        defaultVisible
        overlay={
          <ListGroup vertical>
            {info.node?.contextMenu?.map((item) => {
              return <ListGroup.Item as="button" onClick={() => {
                ReactDOM.unmountComponentAtNode(this.cmContainer);
                item.action()
              }}>{item.label}</ListGroup.Item>
            })}
          </ListGroup>
        }
      >
        <span />
      </Tooltip>
    );
    const container = this.getContainer();
    Object.assign(this.cmContainer.style, {
      position: 'absolute',
      left: `${info.event.pageX}px`,
      top: `${info.event.pageY}px`,
    });

    ReactDOM.render(this.toolTip, container);
  }
  onExpand = (expandedKeys) => {
  };

  onSelect = (selectedKeys, info) => {
    this.selKey = info.node.props.eventKey;
  };

  onCheck = (checkedKeys, info) => {
  };

  onEdit = () => {
  };

  onDel = (e) => {
    if (!window.confirm('sure to delete?')) {
      return;
    }
    e.stopPropagation();
  };

  setTreeRef = (tree) => {
    this.tree = tree;
  };

  filterNodeList = (nodeList, nodeKey) => {
    let filteredList = []
    if (Array.isArray(nodeList) && nodeList.length > 0) {
      nodeList.forEach((node) => {
        if (node.key !== nodeKey) {
          if (Array.isArray(node.children)) {
            let children = []
            node.children.forEach((childNode) => {
              if (childNode.key !== nodeKey) {
                children.push(childNode)
              }
            })
            node.children = children
          }
          filteredList.push(node)
        }
      })
    }
    return filteredList
  }

  handleNodeRename = (nodeKey, newName) => {
    if (newName == "new") {
      throw "File name already exist";
    }
    else {
      const nodeList = this.state.treeDataState
      let modifiedList = []
      if (Array.isArray(nodeList) && nodeList.length > 0) {
        nodeList.forEach((node) => {
          if (node.key === nodeKey) {
            // TODO - modify the key and activeFileKey if the Node is active one.
            node.title = newName;

          }
          if (Array.isArray(node.children)) {
            let children = []
            node.children.forEach((childNode) => {
              if (childNode.key === nodeKey) {
                childNode.title = newName;
              }
              children.push(childNode)
            })
            node.children = children
          }
          modifiedList.push(node)
        })
      }
      this.setState({ treeDataState: modifiedList })
    }

  }

  handleAddNewFile = (parentNodeKey, nodeName) => {
    if (nodeName === "new") {
      throw "File name already exist"
    }
    const nodeList = this.state.treeDataState
    let modifiedList = []
    if (Array.isArray(nodeList) && nodeList.length > 0) {
      nodeList.forEach((node) => {
        if (node.key === parentNodeKey && Array.isArray(node.children)) {
          node.children.unshift({
            key: `${node.title}/${nodeName}`, title: nodeName,
            contextMenu: [
              {
                label: 'Rename',
                action: () => {
                  console.log('Rename file action');
                },
              },
              {
                label: 'Delete',
                action: () => {
                  console.log('Delete file action');
                },
              },
            ],
          })
        }
        modifiedList.push(node)
      })
    }
    this.setState({ treeDataState: modifiedList })
  }

  handleChildDel = (childNodeKey) => {

    const newTreeDataState = this.filterNodeList(this.state.treeDataState, childNodeKey)
    this.setState({ treeDataState: newTreeDataState })
  }

  handleUploadNodeData = (parentNodeKey) => {
  }

  render() {
    // const { treeData } = this.props
    const treeData = this.state.treeDataState
    const customLabel = (
      <span className="cus-label">
        <span>operations: </span>
        <span style={{ color: 'blue' }} onClick={this.onEdit}>
          Edit
        </span>
        &nbsp;
        <label onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" /> checked
        </label>
        &nbsp;
        <span style={{ color: '#EB0000' }} onClick={this.onDel}>
          Delete
        </span>
      </span>
    );
    return (
      <div style={{ margin: '0 20px' }}>
        {/* <h2>simple</h2>
        <input aria-label="good" />
        <Tree
          ref={this.setTreeRef}
          className="myCls"
          showLine
          checkable
          defaultExpandAll
          defaultExpandedKeys={this.state.defaultExpandedKeys}
          onExpand={this.onExpand}
          defaultSelectedKeys={this.state.defaultSelectedKeys}
          defaultCheckedKeys={this.state.defaultCheckedKeys}
          onSelect={this.onSelect}
          onCheck={this.onCheck}
          onActiveChange={(key) => console.log('Active:', key)}
        >
          <TreeNode title="parent 1" key="0-0">
            <TreeNode title={customLabel} key="0-0-0">
              <TreeNode title="leaf" key="0-0-0-0" style={{ background: 'rgba(255, 0, 0, 0.1)' }} />
              <TreeNode title="leaf" key="0-0-0-1" />
            </TreeNode>
            <TreeNode title="parent 1-1" key="0-0-1">
              <TreeNode title="parent 1-1-0" key="0-0-1-0" disableCheckbox />
              <TreeNode title="parent 1-1-1" key="0-0-1-1" />
            </TreeNode>
            <TreeNode title="parent 1-2" key="0-0-2" disabled>
              <TreeNode title="parent 1-2-0" key="0-0-2-0" checkable={false} />
              <TreeNode title="parent 1-2-1" key="0-0-2-1" />
            </TreeNode>
          </TreeNode>
        </Tree>

        <h2>Check on Click TreeNode</h2>
        <Tree
          className="myCls"
          showLine
          checkable
          selectable={false}
          defaultExpandAll
          onExpand={this.onExpand}
          defaultSelectedKeys={this.state.defaultSelectedKeys}
          defaultCheckedKeys={this.state.defaultCheckedKeys}
          onSelect={this.onSelect}
          onCheck={this.onCheck}
          treeData={treeData}
        /> */}

        {/* <h2>Select</h2> */}
        <Tree
          // onRightClick={this.onRightClick}
          ref={this.treeRef}
          className="myCls"
          defaultExpandAll
          treeData={treeData}
          onSelect={this.onSelect}
          height={150}
          selectedKeys={[this.props.activeFileKey]}
          handleChildDel={this.handleChildDel}
          handleNodeRename={this.handleNodeRename}
          handleAddNewFile={this.handleAddNewFile}
          handleUploadNodeData={this.handleUploadNodeData}
          showLine
        />

        {/* <button
          type="button"
          onClick={() => {
            setTimeout(() => {
              console.log('scroll!!!');
              this.treeRef.current.scrollTo({ key: '0-0-1-9' });
            }, 100);
          }}
        >
          Scroll Last
        </button> */}
      </div>
    );
  }
}

export default RcTreeBasic;
