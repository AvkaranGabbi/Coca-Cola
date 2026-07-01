import { forwardRef, Suspense, useRef, useEffect, useLayoutEffect } from 'react'
import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Html, Environment } from '@react-three/drei'
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger'
import { degToRad } from 'three/src/math/MathUtils.js';
import 'remixicon/fonts/remixicon.css'

gsap.registerPlugin(ScrollTrigger);

const Model = forwardRef((props, ref) => {
  const result = useLoader(GLTFLoader, './coca-cola.glb');

  useFrame(() => {
    if(ref.current) {
      ref.current.rotation.y = (ref.current.rotation.y + 0.02) % (Math.PI *2);
    }
  });

  useEffect(() => {
  result.scene.traverse((child) => {
    if (child.isMesh && child.material && 'metalness' in child.material) {
      child.castShadow = true;
      child.material.metalness = 0.5;    // lower = less metallic
      child.material.roughness = 0;    // higher = more matte
      child.material.needsUpdate = true;
    }
  });
}, [result]);

  return <group ref={ref} position={[0, -0.8, 1]} scale={0.4} rotation={[0, 0, degToRad(5)]} >
  <primitive object={result.scene} castShadow />
  </group>
});

function App() {

  const modelref = useRef();

  useEffect(() => {
    const main2 = document.querySelector("canvas");
    const side = document.querySelector(".nav i");
    const cross = document.querySelector(".full i");
    const txt = document.querySelectorAll(".full h4");

    function handleMouseMove(dets) {
      if (!modelref.current) return;

      const movex = (dets.clientX / main2.getBoundingClientRect().width) * 2;

      gsap.to(modelref.current.rotation, {
        y: movex * Math.PI,
        duration: 0.5,
        ease: "ease.inOut"
      });
    }

    main2.addEventListener("mousemove", handleMouseMove);

    side.addEventListener("click", function()
    {
      const tl = gsap.timeline();

      tl.to(".full", 
        {
          right: "0%"
        }
      );

      tl.to(".sideCont", {
        opacity: 1,
        stagger: 0.2,
        x: 40,
        delay: -0.5,
        duration: 0.4,
        ease: "back.inOut"
      });

    });

    cross.addEventListener("click", function(){
      const tl = gsap.timeline();

      tl.to(".sideCont", {
        opacity: 0,
        stagger: 0.2,
        delay: 0.1,
        duration: 0.4,
        x: 100,
        ease: "back.inOut"
      });

      tl.to(".full", {
        right: "-40%",
        delay: -0.3
      });

    });

    txt.forEach((item) => {
      item.addEventListener("mouseenter", function(){
        gsap.to(this, {
          scale: 1.2,
          duration:0.3,
          rotateZ: 5
        });
      });
      item.addEventListener("mouseleave", function(){
        gsap.to(this, {
          scale:1,
          duration:0.3,
          rotateZ: 0
        });
      });
    })

    return () => {
      main2.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".desctext1", {
        y:71,
        duration:1,
        delay:1,
        ease: "back.out(4)"
      });

      gsap.from(".desctext2", {
        y:71,
        duration:1,
        delay:1,
        ease: "back.out(4)"
      });
    });

    return () => ctx.revert();
  }, []); 

  useEffect(() => {
    const move = document.querySelector(".move");
    if (!move) return;

    move.innerHTML += move.innerHTML; // duplicate once

    let speed = 3; // smaller for smoother
    let pos = 0;
    const totalWidth = move.scrollWidth / 2; // width of original content

    gsap.ticker.add(() => {
      pos -= speed;
      pos = ((pos % totalWidth) + totalWidth) % totalWidth; // wrap value smoothly
      gsap.set(move, { x: -pos });
    });

    const handleWheel = (e) => {
      const isDown = e.deltaY > 0;
      speed = isDown ? Math.abs(speed) : -Math.abs(speed);
      gsap.to(".arrow", {
        rotate: isDown ? 0 : 180,
        duration: 1,
        ease: "back.out"
      });
    };
    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      gsap.ticker.remove(() => {});
    };
  }, []);

  useEffect(() => {
    const brandElements = document.querySelectorAll(".brands");

    brandElements.forEach((brand) => {
      const handleEnter = () => {
        gsap.to(brand, { scale: 1.2, duration: 0.3, ease: "back.out(2)", cursor: "pointer" });
      };
      const handleLeave = () => {
        gsap.to(brand, { scale: 1, duration: 0.3, ease: "back.out(2)", cursor: "pointer" });
      };

      brand.addEventListener("mouseenter", handleEnter);
      brand.addEventListener("mouseleave", handleLeave);

      // Cleanup on unmount
      return () => {
        brand.removeEventListener("mouseenter", handleEnter);
        brand.removeEventListener("mouseleave", handleLeave);
      };
    });
  }, []);

  useEffect(() => {
    const big = document.querySelector(".string");
    if (!big) return;

    const initialY = 5; // middle of container
    const initialPath = `M 0 ${initialY} Q 750 ${initialY} 1300 ${initialY}`;

    big.addEventListener("mousemove", (e) => {
      const rect = big.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top; 

      // keep baseline constant, let curve go up or down
      const y = initialY + (relativeY - rect.height / 2);

      const finalPath = `M 0 ${initialY} Q ${x} ${y} 1300 ${initialY}`;

      gsap.to(".realstring", {
        attr: { d: finalPath },
        duration: 0.2,
        ease: "power3.out",
      });
    });

    big.addEventListener("mouseleave", () => {
      gsap.to(".realstring", {
        attr: { d: initialPath },
        duration: 2,
        ease: "elastic.out(1, 0.1)",
      });
    });
  }, []);

  useLayoutEffect(() =>{
    const ctx = gsap.context(() => {
      gsap.to(".scrolls h1", {
        transform: "translateX(-190%)",
        scrollTrigger: {
          trigger: ".scrolls",
          scroller: "body",
          start: 'top 0%',
          end: 'top -100%',
          scrub: 2,
          pin: true,
          // markers: true,
          // anticipatePin: 1
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
    <style>{`html, body { overflow-x: hidden; }`}</style>
    <section className="relative w-full h-screen">
      <Canvas className="w-full h-full absolute top-0 left-0 z-0" shadows camera={{ position: [0, 0.8, 8], fov: 50 }}>
        <directionalLight intensity={0.9} position={[0, 1, 0]} castShadow />
        <ambientLight intensity={0.9} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[30, 20]} />
          <meshStandardMaterial color="#d60000" />
        </mesh>

        <mesh position={[0, 3.5, -5]} receiveShadow>
          <planeGeometry args={[30, 10]} />
          <meshStandardMaterial color="#d60000" />
        </mesh>

        <Environment
        // files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/studio_small_09_2k.hdr" 
        files="./lighting_09.hdr"
        />

        <Suspense fallback={<Html><span style={{ color: 'white' }}>Loading...</span></Html>}>
          <Model ref={modelref} />
        </Suspense>
      </Canvas>


        <div className='desc text-white h-20 absolute bottom-48 left-10'>
          <h1 className='desctext1 text-7xl h-fit'>Original</h1>
        </div>
        <div className='desc text-white absolute bottom-30 left-10'>
          <h1 className='desctext2 text-7xl h-fit'>Coca-Cola</h1>
        </div>
      <div className="main absolute top-0 left-0 z-10 w-full text-white pointer-events-none">
        <div className="nav flex items-center justify-between px-10 pt-10 pointer-events-auto">
          <img className='logo h-60' src='./logo.png' alt="" />
          <i className="ri-menu-3-fill text-4xl hover:cursor-pointer"></i>
        </div>
        <div className="full h-screen w-[40%] absolute top-0 -right-[40%] flex flex-col justify-center gap-20 pointer-events-auto">
          <h4 className='sideCont opacity-0 text-6xl translate-x-1/5 hover:cursor-pointer'>Our Company</h4>
          <h4 className='sideCont opacity-0 text-6xl translate-x-1/5 hover:cursor-pointer'>Brands</h4>
          <h4 className='sideCont opacity-0 text-6xl translate-x-1/5 hover:cursor-pointer'>Careers</h4>
          <h4 className='sideCont opacity-0 text-6xl translate-x-1/5 hover:cursor-pointer'>Media Center</h4>
          <h4 className='sideCont opacity-0 text-6xl translate-x-1/5 hover:cursor-pointer'>Investors</h4>
          <i className="ri-close-line hover:cursor-pointer absolute top-[5%] right-[10%] color-white text-4xl"></i>
        </div>
      </div>
    </section>

    <div className='bg-white h-70 w-full overflow-hidden relative flex items-center'>
      <div className='move flex'>
        <div className='marque flex items-center'>
          <h1 className='refresh text-7xl inline-block px-10'>Refresh The World</h1>
          <i className="arrow ri-arrow-right-line text-6xl"></i>
        </div>
        <div className='marque flex items-center'>
          <h1 className='refresh text-7xl inline-block px-10'>Refresh The World</h1>
          <i className="arrow ri-arrow-right-line text-6xl"></i>
        </div>
        <div className='marque flex items-center'>
          <h1 className='refresh text-7xl inline-block px-10'>Refresh The World</h1>
          <i className="arrow ri-arrow-right-line text-6xl"></i>
        </div>
        <div className='marque flex items-center'>
          <h1 className='refresh text-7xl inline-block px-10'>Refresh The World</h1>
          <i className="arrow ri-arrow-right-line text-6xl"></i>
        </div>
        <div className='marque flex items-center'>
          <h1 className='refresh text-7xl inline-block px-10'>Refresh The World</h1>
          <i className="arrow ri-arrow-right-line text-6xl"></i>
        </div>
      </div>
    </div>

    <div className='main2 w-full h-280'>
      <div className='string h-50'>
        <svg className='string2'>
          <path className='realstring' d="M 0 5 Q 750 5 1300 5" stroke='black' fill='transparent' />
        </svg>
      </div>

      <h1 className='sayhi text-7xl'>Say "Hi" to the Team</h1>
      <img src="./cocacola.webp" className='brands' />
      <img src="./zero.webp" className='brands' />
      <img src="./sprite.webp" className='brands' />
      <img src="./fanta.webp" className='brands' />
      <img src="./topochico.webp" className='brands' />
      <img src="./fairlife.webp" className='brands' />
      <img src="./costa.webp" className='brands' />
      <img src="./powerade.webp" className='brands' />
    </div>

    {/* <div className='scrolls h-screen w-full overflow-hidden bg-red-500'>
      <h1 className='taste text-[35vw]'>
        TasteTheFeeling!
      </h1>
    </div>

    <div className='h-[105vh] w-full bg-green-500'>
    </div> */}
    </>
  )
}

export default App 