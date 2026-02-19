import { Dispatch, SetStateAction } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
export default function ZoomedImage({
  image,
  setSelectedImage,
}: {
  image: string;
  setSelectedImage: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      onClick={() => setSelectedImage("")}
    >
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={6}
        centerOnInit={true}
        wheel={{ step: 1 }}
        limitToBounds={true}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div
              className="absolute top-5 right-5 z-50 flex gap-2 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => zoomIn()}
                className="bg-white/20 p-2 rounded text-white cursor-pointer"
              >
                +
              </button>
              <button
                onClick={() => zoomOut()}
                className="bg-white/20 p-2 rounded text-white cursor-pointer"
              >
                -
              </button>
              <button
                onClick={() => {
                  resetTransform();
                  setSelectedImage("");
                }}
                className="bg-red-500/80 p-2 rounded text-white cursor-pointer"
              >
                X
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
              }}
              contentStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="cursor-grab active:cursor-grabbing"
              >
                <img
                  src={image}
                  alt="Zoomed Preview"
                  className="max-w-[100vw] max-h-[100vh] object-contain shadow-2xl"
                />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
