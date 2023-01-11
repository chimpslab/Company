import _, { update } from "lodash";


export class PTImageInput extends HTMLElement {
    opt: any;
    loader: HTMLInputElement;
    preview: HTMLImageElement;
    output: HTMLInputElement;

    connectedCallback() {
        this.preview = this.querySelector<HTMLImageElement>(".preview");
        this.loader = this.querySelector<HTMLInputElement>("[data-loader]");
        this.output = this.querySelector<HTMLInputElement>("[data-output]");
        this.opt = {
            sizes: [128, 48],
            canvasClass: "logo align-self-center ml-3"
        }
    
        this.loader.addEventListener("change", e => {

            const reader = new FileReader();
            reader.onloadend = () => {
                this.update(reader.result.toString())
            };
            reader.readAsDataURL((e.target as any).files[0]);
        });

        if (this.output.value) {
            this.preview.src = this.output.value;
        }
    }
    
    update(base64str: string) {
        const img = new Image();
        img.onload = (e) => {this.onloadend(e)};
        img.src = base64str;
    }

    onloadend(e: any){
        const img = <HTMLImageElement>e.target;
        const $canvas = this.querySelectorAll<HTMLCanvasElement>("canvas");
        const icons = Array($canvas.length).fill("data:,");
        _.forEach($canvas, (canvas,i) => {
            const context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
            icons[i] = canvas.toDataURL("image/png");

            context.fillStyle = "#303030A0";
            context.fillRect(0, 0, canvas.width, 14);
            context.fillStyle = "white"; // "#A0A0A00A";
            context.font = "10px serif";
            context.textBaseline = "top";
            if (canvas.width == canvas.height) {
                context.fillText(`${canvas.width}px`, 2, 2);
            } else {
                context.fillText(`${canvas.width}px * ${canvas.height}px`, 2, 2);
            }
        })

        if ($canvas.length == 0) {
            this.preview.src = img.src;
        }

        this.output.value = this.preview.src;

        $(this).trigger("onupdate", {icons});
    }
}
