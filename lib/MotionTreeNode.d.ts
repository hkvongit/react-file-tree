import * as React from 'react';
import { TreeNodeProps } from './TreeNode';
import { FlattenNode } from './interface';
import { TreeNodeRequiredProps } from './utils/treeUtil';
interface MotionTreeNodeProps extends Omit<TreeNodeProps, 'domRef'> {
    active: boolean;
    motion?: any;
    motionNodes?: FlattenNode[];
    onMotionStart: () => void;
    onMotionEnd: () => void;
    motionType?: 'show' | 'hide';
    treeNodeRequiredProps: TreeNodeRequiredProps;
    handleChildDel?: (nodeKey: string | number) => void;
    handleNodeRename?: (newName: string | number) => void;
    handleAddNewFile?: (nodeName: string | number) => void;
    handleUploadNodeData?: (parentNodeKey: string | number) => void;
}
declare const RefMotionTreeNode: React.ForwardRefExoticComponent<MotionTreeNodeProps & React.RefAttributes<HTMLDivElement>>;
export default RefMotionTreeNode;
