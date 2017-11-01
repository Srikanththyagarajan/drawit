import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import { LinkShell } from '../shells'

const cache = {}

const getLinkByType = (type, children) => {
    if ( !cache[type] ) {
        cache[type] = children.find(child => child.props.type === type)
    }

    return cache[type]
}

export default class LayerLinks extends React.Component {
    state = { offsetX: 0, offsetY: 0 }

    static propTypes = {
        models: PropTypes.array,
        children: PropTypes.any,
        onChangeLinkModel: PropTypes.func
    }
    componentDidMount() {
        const ref = ReactDOM.findDOMNode(this)
        const rect = ref.getBoundingClientRect()

        this.setState({
            offsetX: rect.left,
            offsetY: rect.top
        })
    }

    render() {
        const { offsetX, offsetY } = this.state
        const { value, children, onChangeLinkModel } = this.props
        const { links } = value

        return (
            <div className="Drawit--Diagram--Links">
                <svg>
                {
                    Object.keys(links).map(key => {
                        const model = links[key]
                        const { type } = model
                        const link = getLinkByType(type, children)

                        return (
                            <LinkShell
                                key={model.id}
                                model={model}
                                link={link}
                                offsetX={offsetX}
                                offsetY={offsetY}
                                onChange={onChangeLinkModel}
                            />
                        )
                    })
                }
                </svg>
            </div>
        )
    }
}