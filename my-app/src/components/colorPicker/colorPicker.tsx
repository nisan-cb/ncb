import React, {useEffect, useRef} from 'react'
import styled from 'styled-components'


const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items:center;
    justify-content: center;
`
const Canvas = styled.canvas`
    border: 3px solid rgba(15,15,15,0.2);
    width: ${props => props.width}px;
    height: ${props => props.height}px;
    margin: 20px 0;
`

const SelectedColor = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid rgba(15,15,15,0.2);
    /* background-color: ${props => props.color} */
`

const ColorPicker = ()=> {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selectedColorRef = useRef<HTMLDivElement>(null);
    const selectedColor = useRef<string>('');
    const isMouseDown = useRef<boolean>(false);

    const {width, height} = {width:500, height:400}
    const pickerCircle = {x:100 , y:100, width: 7 , height: 7};
    // const context =  canvasRef.current?.getContext('2d');
    
    useEffect(()=>{
        // draw palette
        draw();

        // Listener to event
        canvasRef.current?.addEventListener('mousedown',onMouseDown);
        canvasRef.current?.addEventListener('mousemove',onMouseMove);
        canvasRef.current?.addEventListener('mouseup',onMouseUp);
    },[]);

    const getPickedColor = ()=>{
        const context =  canvasRef.current?.getContext('2d');
        const imageData = context?.getImageData(pickerCircle.x, pickerCircle.y,1,1);
        return {r: imageData?.data[0], g:imageData?.data[1], b:imageData?.data[2]}  
    }

    const onMouseUp = ()=>{
        isMouseDown.current = false;
    }

    const onMouseMove = (e: MouseEvent)=>{
        if(!isMouseDown.current) return;
        const x = e.clientX - canvasRef.current?.offsetLeft!;
        const y = e.clientY - canvasRef.current?.offsetTop!;
        if(x<0 || y<0 || x> width ||y>width){
            isMouseDown.current = false;
        }else{
            pickerCircle.x = x - pickerCircle.width/2;
            pickerCircle.y = y - pickerCircle.height/2;
            draw();
        }
    }

    const onMouseDown = (e: MouseEvent)=>{
        const x = e.clientX - canvasRef.current?.offsetLeft!;
        const y = e.clientY - canvasRef.current?.offsetTop!;
        pickerCircle.x = x - pickerCircle.width/2;
        pickerCircle.y = y - pickerCircle.height/2;
        draw();
        isMouseDown.current = true;
    }

    const draw = () =>{
        const context =  canvasRef.current?.getContext('2d');
        initPalette(context);
        drawCircle(context);
        const color = getPickedColor();
        if(selectedColorRef.current)
            selectedColorRef.current.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})` ;
    }

    const drawCircle = (context:CanvasRenderingContext2D | null | undefined)=>{
        // Circle
        if(!context) return;
        context.beginPath();
        context.arc(pickerCircle.x, pickerCircle.y,pickerCircle.width, 0, Math.PI * 2);
        context.strokeStyle = "black";
        context.stroke();
        context.closePath();
    }

    const initPalette = (context:CanvasRenderingContext2D | null | undefined )=>{
        if(!context) return;
        let gradient = context?.createLinearGradient(0,0, width, 0);

        // Add basic colors
        gradient?.addColorStop(0, 'rgba(255, 0,0)');
        gradient?.addColorStop(0.15, 'rgba(255, 0,255)');
        gradient?.addColorStop(0.33, 'rgba(0, 0,255)');
        gradient?.addColorStop(0.49, 'rgba(0, 255,255)');
        gradient?.addColorStop(0.67, 'rgba(0, 255,0)');
        gradient?.addColorStop(0.84, 'rgba(255, 255,0)');
        gradient?.addColorStop(1, 'rgba(255, 0,0)');

        context.fillStyle = gradient;
        context.fillRect(0,0, width, height);

        // Apply black anw white
        gradient = context?.createLinearGradient(0,0, 0, height);
        gradient?.addColorStop(0, 'rgba(255, 255,255,1)');
        gradient?.addColorStop(0.5, 'rgba(255, 255,255,0)');
        gradient?.addColorStop(0.5, 'rgba(0, 0,0,0)');
        gradient?.addColorStop(1, 'rgba(0,0,0,1)');

        context.fillStyle = gradient;
        context.fillRect(0,0, width, height);
    }

  return (
    <Wrapper>
        <h2>Color Picker</h2>
        <Canvas ref={canvasRef} width={width} height={height} ></Canvas>
        <SelectedColor ref={selectedColorRef} color={selectedColor.current}></SelectedColor>
    </Wrapper>
  )
}

export default ColorPicker