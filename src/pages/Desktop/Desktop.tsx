import type { JSX } from "react";
import image2 from "./image-2.png";
import image3 from "./image-3.png";
import "./style.css";

export const Desktop = (): JSX.Element => {
    return (
        <div className="desktop">
            <div className="text-wrapper">SẢN PHẨM</div>

            <div className="div">VỀ ORCHA</div>

            <div className="text-wrapper-2">BLOG</div>

            <p className="p">SẢN PHẨM MỚI CỦA ORCHA</p>

            <div className="text-wrapper-3">BLOG VỀ ORCHA</div>

            <div className="text-wrapper-4">LIÊN HỆ</div>

            <p className="text-wrapper-5">
                ORCHA là thương hiệu cung cấp nước và phân bón sinh học từ quá trình
                lên men trái cây với men vi sinh tự nhiên, mang đến giải pháp nuôi dưỡng
                đất và cây trồng theo hướng bền vững, an toàn và thân thiện với môi
                trường.
            </p>

            <p className="text-wrapper-6">
                ORCHA – Từ lên men xanh đến mùa vụ lành
            </p>

            <div className="rectangle" />

            <div className="text-wrapper-7">Xem thêm</div>

            <div className="rectangle-2" />

            <div className="rectangle-3" />

            <div className="rectangle-4" />

            <div className="rectangle-5" />

            <div className="rectangle-6" />

            <div className="rectangle-7" />

            <div className="rectangle-8" />

            <div className="rectangle-9" />

            <img className="image" alt="Image" src={image2} />

            <img className="img" alt="Image" src={image3} />
        </div>
    );
};
