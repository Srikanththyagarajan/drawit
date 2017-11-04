import React from 'react'
import PropTypes from 'prop-types'

import { DefaultNode, DefaultLink } from './defaults'
import { buildConf, Node, Link } from './conf'
import { LayerNodes, LayerLinks } from './layers'
import { makeUID, toCache, DragContext } from './utils'

const createPortModel = ( pModel = {}, parentID, position ) => {
    /**
     * model: {
     *      id,
     *      type,
     *      parentID,
     *      position
     * }
     */

    return {
        id: makeUID(),
        type: 'default',
        parentID,
        position,
        ...pModel
    }
}

const createPointModel = ( pModel = {}, parentID ) => {
    return {
        id: makeUID(),
        type: 'default',
        parentID,
        x: 0,
        y: 0,
        ...pModel
    }
}

export default class Diagram extends React.Component {
    static propTypes = {
        children: PropTypes.any,
        value: PropTypes.object,
        onChange: PropTypes.func
    }

    // TODO make this an external func
    updateValue(nextProps) {
        const { value, onChange = () => {} } = this.props

        onChange({
            ...value,
            ...nextProps
        })
    }

    addNode( model ) {
        /**
         * model: {
         *      id,
         *      type,
         *      ports: {
         *          left: portID,
         *          top: portID
         *      }
         * }
         */

        const { value } = this.props
        const { nodes = {}, ports = {} } = value

        // can i modify model? no
        // const { id, type } = model
        const newNodeModel =
            Object.assign({
                id: makeUID(),
                type: 'default',
                ports: {
                    left: {
                        type: 'default'
                    },
                    right: {
                        type: 'default'
                    }
                }
            }, model)
        
        const newPortModels = Object.keys(newNodeModel.ports).reduce((output, key) => {
            const portModel = createPortModel(newNodeModel.ports[key], newNodeModel.id, key)
            output[key] = portModel

            return output
        }, {})

        newNodeModel.ports = Object.keys(newPortModels).reduce((output, key) => {
            output[key] = newPortModels[key].id

            return output
        }, {})

        this.updateValue({
            nodes: {
                ...nodes,
                [newNodeModel.id]: newNodeModel
            },
            ports: {
                ...ports,
                ...Object.keys(newPortModels).reduce((output, key) => {
                    const portModel = newPortModels[key]
                    output[portModel.id] = portModel

                    return output
                }, {})
            }
        })

        // return modified model
    }

    addLink( model = {} ) {
        const { value } = this.props
        const { links = [], points = [] } = value

        const nextModel =
            Object.assign({
                id: makeUID(),
                type: 'default',
                points: [{
                    x: 0,
                    y: 0,
                    type: 'default'
                }, {
                    x: 100,
                    y: 100,
                    type: 'default'
                }]
            }, model)
        
        const newPointModels = nextModel.points.map(model => createPointModel(model, nextModel.id))
        nextModel.points = newPointModels.map(model => model.id)

        this.updateValue({
            links: {
                ...links,
                [nextModel.id]: nextModel
            },
            points: {
                ...points,
                ...toCache(newPointModels)
            }
        })
    }

    handleChangeEntityModel = (entityKey, entityModel) => {
        const { value } = this.props
        const existingEntityModels = value[entityKey]
        const nextEntityModels = {
            ...existingEntityModels,
            [entityModel.id]: entityModel
        }

        this.updateValue({
            [entityKey]: nextEntityModels
        })
    }
    
    // TODO make this an external func
    handleChangeNodeModel = model => this.handleChangeEntityModel('nodes', model)
    handleChangeLinkModel = model => this.handleChangeEntityModel('links', model)
    handleChangePointModel = model => this.handleChangeEntityModel('points', model)
    handleChangePortModel = model => this.handleChangeEntityModel('ports', model)

    render() {
        const { value: pValue = {}, children } = this.props
        const value = { nodes: {}, links: {}, ports: {}, points: {}, ...pValue }
        const conf = buildConf(this)

        // console.log(`[Diagram] Created conf: `, conf)

        return (
            <div className="Drawit--Diagram">
                <DragContext>
                    <LayerNodes
                        conf={conf}
                        value={value}
                        onChangeNodeModel={ this.handleChangeNodeModel }/>
                    <LayerLinks
                        conf={conf}
                        value={value}
                        onChangePointModel={ this.handleChangePointModel }
                        onChangePortModel={ this.handleChangePortModel } />
                </DragContext>
            </div>
        )
    }
}