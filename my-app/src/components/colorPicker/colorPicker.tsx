import React, {FC, useEffect, useRef} from 'react'
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
    border-radius: 22px
`

const SelectedColor = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid rgba(15,15,15,0.2);
`

interface RGBcolor{
    r:number;
    g:number;
    b:number;
}
interface ColorPickerProps{
    currentColor?: string;
    setColor?: (newColor: string)=>void;
}

const DEFAULT_COLOR = '#7fffae';


const ColorPicker: FC<ColorPickerProps> = ({currentColor=DEFAULT_COLOR,setColor})=> {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stripRef = useRef<HTMLCanvasElement>(null);
    const selectedColorRef = useRef<HTMLDivElement>(null);
    const selectedColor = useRef<string>('');
    const isMouseDown = useRef<boolean>(false);

    const {width, height} = {width:500, height:400}
    const {sWidth, sHeight} = {sWidth: 500, sHeight:15}
    const pickerCircle = {x:100 , y:100, width: 7 , height: 7};
    const stripCircle = {x:100 , y:7, width: 7.5 , height: 7.5};
    
    useEffect(()=>{
        // draw palette
        initPalette();

        const rgbColor = hexToRgb(currentColor);
        if(rgbColor){
            const coordinates = findColorInCanvas(rgbColor);
            pickerCircle.x = coordinates?.x || 0;
            pickerCircle.y = coordinates?.y || 0;
        }
        if(selectedColorRef.current)
            selectedColorRef.current.style.backgroundColor = `rgb(${rgbColor?.r}, ${rgbColor?.g}, ${rgbColor?.b})` ;
        drawCircle();
        createStrip();

        // Listener to event
        canvasRef.current?.addEventListener('mousedown',onMouseDown);
        canvasRef.current?.addEventListener('mousemove',onMouseMove);
        canvasRef.current?.addEventListener('mouseup',onMouseUp);

    },[]);

    const createStrip = ()=>{
        const context =  stripRef.current?.getContext('2d');

        /* canvasRef.current?.addEventListener('mousedown',onMouseDown);
        canvasRef.current?.addEventListener('mousemove',onMouseMove);
        canvasRef.current?.addEventListener('mouseup',onMouseUp); */
        if(!context) return;
        let gradient = context?.createLinearGradient(0,0, width, 0);

        // Add basic colors
        gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
        gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
        gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
        gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

        context.fillStyle = gradient;
        context.fillRect(0,0, sWidth, sHeight);

        context.beginPath();
        context.arc(stripCircle.x, stripCircle.y,stripCircle.width, 0, Math.PI * 2);
        context.strokeStyle = "black";
        context.stroke();
        context.closePath();


    }


    const findColorInCanvas = (rgbColor: RGBcolor)=>{
        const context =  canvasRef.current?.getContext('2d');
        const imageData = context?.getImageData(0, 0,width,height);
        if(!imageData) return
        let i;
        // [12, 12, 12, 12, 11, 11, 11, 11 ...]
        for(i = 0 ;i<imageData?.data.length/4 ;i++){
            const pixelRGBA = imageData.data.slice(i*4,i*4+4);
            if(rgbColor.r === pixelRGBA[0] && rgbColor.g === pixelRGBA[1] && rgbColor.b === pixelRGBA[2])
                break;
        }
        
        const x = i% width;
        const y = Math.floor(i / width );

        return {x,y};
    }

    const hexToRgb = (hex:string)=> {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      }

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
        initPalette();
        drawCircle();
        const color = getPickedColor();
        if(selectedColorRef.current)
            selectedColorRef.current.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})` ;
    }

    const drawCircle = ()=>{
        const context =  canvasRef.current?.getContext('2d');
        if(!context) return;
        context.beginPath();
        context.arc(pickerCircle.x, pickerCircle.y,pickerCircle.width, 0, Math.PI * 2);
        context.strokeStyle = "black";
        context.stroke();
        context.closePath();
    }

    const initPalette = ()=>{
        const context =  canvasRef.current?.getContext('2d');

        if(!context) return;
        let gradient = context?.createLinearGradient(0,0, width, 0);

        // Add basic colors
        /* const imageData = context.createImageData(width, height);
        for (var i = 0; i < imageData.data.length; i += 4) {
            var brightness = i / (imageData.data.length - 1);
            imageData.data[i] = brightness * 255;
            imageData.data[i + 1] = brightness * 255;
            imageData.data[i + 2] = brightness * 255;
            imageData.data[i + 3] = 255;
        }
        context.putImageData(imageData, 0, 0); */


        gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
        gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
        gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
        gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

        context.fillStyle = gradient;
        context.fillRect(0,0, width, height);

        // Apply black and white
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