import React, {Component} from 'react';
import './pieceCanvas.css';

// main refs
const containerRef = 'containerRef';
const canvasRef = 'canvasPiece';

// constants
const baseCls = 'x-canvas-piece';
const closeCls = 'fas fa-times-circle fa-2x';
const dragCls = 'x-dragging';

// value to move piece v/h to show it is cut out
const moveBy = 5;

const endTransitionTime = 0.15;

//  on this class overall: i know react's reflow principle.
//  But i think its not best for dragging, so
//  i didnt use setstate and reflows here.
class PieceCanvas extends Component {

    // because dragging listener is over whole document,
    // we need inidcation for class method .drag if this
    // specific instance is being dragged.
    // without this, moving single piece will move all
    // existing pieces
    _isDragging = false;

    constructor(props) {
        super();
        const me = this;
        me.state = {
            coordinates: {},
            currentPos: {x: null, y: null},     // saves current position for main canvas redraws
        }

        me.drag         = me.drag.bind(me);
        me.close        = me.close.bind(me);
        me.dragStart    = me.dragStart.bind(me);
        me.dragEnd      = me.dragEnd.bind(me);
    }

    componentDidMount() {
        const me = this;

        // this has to be whole document and not the piece,
        // otherwise if we swing mouse fast, we might get out of
        // the element, and the over the document(and not the
        // piece) - and the dragging will be f#d up
        document.addEventListener('mousemove', me.drag);

        // prepare the piece
        me.makePiece();
    }

    close(e) {
        //console.log('close')
        e.stopPropagation();
        const me = this;
        if (closeCls === e.target.className) {
            e.stopPropagation();
            const myId = me.props.uid;
            const startCoo = {
                x: me.props.startPos.x - me.getWidth() + moveBy,    // calculate start position
                y: me.props.startPos.y - me.getHeight() + moveBy
            };
            me.refs[containerRef].style = 'transition: '+endTransitionTime+'s; left: '+startCoo.x+'px; top: '+startCoo.y+'px';
            setTimeout(()=>me.props.onRemove(myId), endTransitionTime*1000);
        }
    }

    //#region drag
    drag(e) {
        //console.log('drag')
        e.stopPropagation();
        const me = this;
        if(e.buttons === 1 && me._isDragging) {
            const [width, height] = [me.getWidth(), me.getHeight()];  // basic vars
            const el = me.refs[containerRef];
            me.state.currentPos = {x: (e.clientX-width/2)+'px', y: (e.clientY-height/2)+'px'};
            el.style.left       = me.state.currentPos.x;
            el.style.top        = me.state.currentPos.y;
        }
    }

    // old comment: below methods WERE part of mechanism to prevent
    // `drag overlapping` when dragging piece over piece.
    // by using _isDragging flag.
    // update: solved more elegantly with zIndex
    dragStart(e) {
        e.stopPropagation();
        const me = this;
        const container = me.refs[containerRef];
        container.className = [baseCls,dragCls].join(' ');
        me._isDragging = true;
        //console.log('dragstart')
    }

    dragEnd(e) {
        //console.log('dragend')
        e.stopPropagation();
        const me = this;
        const container = me.refs[containerRef];
        container.className = baseCls;
        me._isDragging = false;
    }
    //#endregion

    getWidth() {
        const me = this;
        return me.props.maxX - me.props.minX;
    }

    getHeight() {
        const me = this;
        return me.props.maxY - me.props.minY;
    }

    getCoordinates() {
        const me = this;
        // check for current position on main canvas redraws
        const posX = me.state.currentPos.x || moveBy + me.props.startPos.x;
        const posY = me.state.currentPos.y || moveBy + me.props.startPos.y;
        return {left: posX, top: posY};
    }

    makePiece() {
        const me = this;
        let [maxX, maxY, minX, minY, positions, imgSrc] = [me.props.maxX, me.props.maxY, me.props.minX, me.props.minY, me.props.positions, me.props.imgSrc];
        let node = me.refs[canvasRef];
        //node.style = 'border: 1px solid red;';        //debug
        node.width = maxX - minX;
        node.height = maxY - minY;
        const ctx = node.getContext('2d');
        const img = new Image();
        img.src = imgSrc;
        ctx.beginPath();
        positions.forEach(p => {
            ctx.lineTo(p.x - minX, p.y - minY);
        });
        ctx.closePath();
        ctx.clip();
        //ctx.restore();
        img.onload = function () {
            ctx.drawImage(img, minX, minY, node.width, node.height, 0, 0, node.width, node.height);
        }
    }

    render() {
        const me = this;
        const coordinates = me.getCoordinates();
        return (
            <figure onMouseUp={me.dragEnd} onMouseDown={me.dragStart} ref={containerRef} style={{...coordinates}} className={baseCls}>
                <canvas ref={canvasRef}></canvas>
                <i onClick={me.close} className={closeCls}></i>
            </figure>
        );
    }
}

export default PieceCanvas;