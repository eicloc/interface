import { Box, Image, Carousel, Button } from 'grommet';
import { useState } from 'react';

export const CarouselComponent = () => {

  const [activeSlide, setActiveSlide] = useState(0);
  
  return (
    <>
    <Box pad={{ horizontal: 'large' }}>
      <Box round="small">
        <Carousel
          controls={false}
          wrap
          play={4000}
          activeChild={activeSlide}
          onChild={setActiveSlide}
        >
          <Box pad="medium">
            <Image
              fill
              src="Carousel images/CarouselFrame1.png"
              alt="carousel image" 
              onClick={() => (window.location.href = 'https://github.com/FLock-io/v1-sdk/tree/main/examples/flock_llm')}
            />
          </Box>
          <Box pad="medium">
            <Image
              fill
              src="Carousel images/CarouselFrame2.png"
              alt="carousel image"
              onClick={() => (window.location.href = '/flockresearcher')}  
            />
          </Box>
          <Box pad="medium">
            <Image
              fill
              src="Carousel images/CarouselFrame3.png"
              alt="carousel image"
              onClick={() => (window.location.href = '/quest')}  
            />
          </Box>
        </Carousel>
      </Box>
      <Box 
        alignSelf="center"
        width="10%"
        direction="row"
        align='center'
        justify="center"
        gap="medium"
      >
        <Button fill color={activeSlide === 0 ? "brand" : "white"} onClick={() => setActiveSlide(0)} />
        <Button fill color={activeSlide === 1 ? "brand" : "white"} onClick={() => setActiveSlide(1)} />
        <Button fill color={activeSlide === 2 ? "brand" : "white"} onClick={() => setActiveSlide(2)} />
      </Box>        
    </Box>
  </>
  );
};
