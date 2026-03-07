import svgPaths from "./svg-09krpimxjn";
import imgImage1 from "figma:asset/529432edabf8a932ca66172134489aa216c93b41.png";
import imgImage2 from "figma:asset/555aff37dfb9a73c561f4d47455eec51f6413072.png";
import imgImage3 from "figma:asset/ce8cdf0f0c8dd35c022e25793abe39b064fab97f.png";

function Frame() {
  return (
    <div className="absolute bg-[#898989] h-[2388px] left-0 overflow-clip top-0 w-[4973px]">
      <div className="absolute h-[1080px] left-[1261px] top-[458px] w-[1920px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[1624px] left-[3359px] top-[256px] w-[750px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
      <div className="absolute h-[1624px] left-[290px] top-[256px] w-[750px]" data-name="image 3">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
      </div>
      <div className="absolute flex h-[164px] items-center justify-center left-[2987px] top-[223px] w-[424px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[21.15deg]">
          <div className="h-0 relative w-[454.612px]">
            <div className="absolute inset-[-22.09px_-0.66%_-22.09px_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 457.612 44.1838">
                <path d={svgPaths.p39829c80} fill="var(--stroke-0, #FF0000)" id="Arrow 1" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[168px] items-center justify-center left-[1088px] top-[212px] w-[1864px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[174.85deg]">
          <div className="h-0 relative w-[1871.555px]">
            <div className="absolute inset-[-29.46px_-0.21%_-29.46px_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1875.56 58.9117">
                <path d={svgPaths.p3f800080} fill="var(--stroke-0, #FF0000)" id="Arrow 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[49px] items-center justify-center left-[843px] top-[924px] w-[545px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[-174.86deg]">
          <div className="h-0 relative w-[547.198px]">
            <div className="absolute inset-[-25.77px_-0.64%_-25.77px_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 550.698 51.5477">
                <path d={svgPaths.p14fc0f00} fill="var(--stroke-0, #FF0000)" id="Arrow 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[402px] items-center justify-center left-[3092px] top-[411px] w-[942px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[-23.11deg]">
          <div className="h-0 relative w-[1024.191px]">
            <div className="absolute inset-[-29.46px_-0.39%_-29.46px_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1028.19 58.9117">
                <path d={svgPaths.p20d50c0} fill="var(--stroke-0, #FF0000)" id="Arrow 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Group() {
  return (
    <div className="relative size-full">
      <Frame />
    </div>
  );
}