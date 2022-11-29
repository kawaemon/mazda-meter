export function main(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
        throw new Error("failed to get 2d context from canvas");
    }

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const app = new Mazda3(ctx);
    const callback = () => {
        app.draw();
        window.requestAnimationFrame(callback);
    };

    callback();
}

type Pos = [number, number];
const { PI: pi, sin, cos } = Math;

class Mazda3 {
    constructor(private canvas: CanvasRenderingContext2D) {}

    private frames: number = 0;

    pos(absX: number, absY: number): Pos {
        const x = this.canvas.canvas.width * absX;
        const y = this.canvas.canvas.height * absY;
        return [x, y];
    }

    polar([centerX, centerY]: Pos, radius: number, sheta: number): Pos {
        const x = centerX + radius * cos(sheta);
        const y = centerY + radius * sin(sheta);
        return [x, y];
    }

    relMin(len: number): number {
        const x = this.canvas.canvas.width;
        const y = this.canvas.canvas.height;
        return x > y ? y * len : x * len;
    }

    debugPos(x: number, y: number) {
        const width = this.canvas.canvas.width;
        const height = this.canvas.canvas.height;

        const prevStroke = this.canvas.strokeStyle;
        const prevLine = this.canvas.lineWidth;

        this.canvas.strokeStyle = "white";
        this.canvas.lineWidth = 1;

        this.canvas.beginPath();
        this.canvas.moveTo(x, 0);
        this.canvas.lineTo(x, height);
        this.canvas.moveTo(0, y);
        this.canvas.lineTo(width, y);
        this.canvas.stroke();

        this.canvas.strokeStyle = prevStroke;
        this.canvas.lineWidth = prevLine;
    }

    circle(
        color: string,
        lineWidth: number,
        center: Pos,
        radius: number,
        angleFrom: number,
        angleTo: number,
    ) {
        this.canvas.beginPath();
        this.canvas.lineWidth = lineWidth;
        this.canvas.strokeStyle = color;
        this.canvas.arc(...center, radius - lineWidth / 2, angleFrom, angleTo);
        this.canvas.stroke();
    }

    piller(
        color: string,
        lineWidth: number,
        center: Pos,
        radius: number,
        sheta: number,
        length: number,
        marginSize: number,
        marginColor: string,
    ) {
        this.canvas.beginPath();
        this.canvas.lineWidth = lineWidth + marginSize * 2;
        this.canvas.strokeStyle = marginColor;
        this.canvas.moveTo(...this.polar(center, radius + marginSize, sheta));
        this.canvas.lineTo(
            ...this.polar(center, radius - length - marginSize, sheta),
        );
        this.canvas.stroke();

        this.canvas.beginPath();
        this.canvas.lineWidth = lineWidth;
        this.canvas.strokeStyle = color;
        this.canvas.moveTo(...this.polar(center, radius, sheta));
        this.canvas.lineTo(...this.polar(center, radius - length, sheta));
        this.canvas.stroke();
    }

    text(props: { pos: Pos; text: string; color: string; font: string }) {
        this.canvas.textBaseline = "middle";
        this.canvas.textAlign = "center";
        this.canvas.fillStyle = props.color;
        this.canvas.font = props.font;
        this.canvas.fillText(props.text, ...props.pos);
    }

    draw() {
        this.frames += 1;

        ////////////////////////////////////

        const props = {
            angleFrom: -1.25 * pi,
            angleTo: 0.25 * pi,
            background: "#050505",
            center: this.pos(0.5, 0.5),
            radius: this.relMin(0.3),
        };

        const outerRing = {
            color: "#404040",
            lineWidth: this.relMin(0.02),
        };

        // width is larger
        const largePiller = {
            color: "white",
            length: this.relMin(0.04),
            lineWidth: this.relMin(0.0065),
            count: 9,
            margin: {
                color: props.background,
                size: this.relMin(0.00325),
            },
        };

        const smallPiller = {
            color: "white",
            length: this.relMin(0.024),
            lineWidth: this.relMin(0.005),
            radius: props.radius - outerRing.lineWidth / 2,
            count: largePiller.count - 1,
            margin: {
                color: props.background,
                size: this.relMin(0.00325),
            },
        };

        const tinyPiller = {
            color: "white",
            length: this.relMin(0.013),
            lineWidth: this.relMin(0.003),
            radius: smallPiller.radius,
            count: smallPiller.count * 2,
            margin: {
                color: props.background,
                size: this.relMin(0.0025),
            },
        };

        const innerRing = {
            color: "#373737",
            lineWidth: this.relMin(0.003),
            radius: props.radius - this.relMin(0.027),
            margin: {
                color: props.background,
                size: this.relMin(0.0025),
            },
            piller: {
                count: tinyPiller.count * 2,
                length: this.relMin(0.017),
            },
        };

        const label = {
            color: "white",
            font: "48px Alexandria",
            letterSpacing: "-3px",
            text: (largePillerIndex: number) => `${largePillerIndex * 20}`,
            radius: props.radius - this.relMin(0.077),
        };

        const unitLabel = {
            pos: this.polar(
                props.center,
                props.radius - this.relMin(0.104),
                -0.5 * pi,
            ),
            text: "mph",
            color: "white",
            font: "24px Alexandria",
        };

        const gearLabel = {
            pos: this.polar(
                props.center,
                props.radius - this.relMin(0.12),
                0.5 * pi,
            ),
            text: "P",
            color: "white",
            font: "60px Alexandria",
        };

        const needleAnimationFrames = 60 * 5;
        const currentAnimationFrame = this.frames % needleAnimationFrames;
        const animationProgress = currentAnimationFrame / needleAnimationFrames;
        const needlePosProgress =
            animationProgress < 0.5
                ? animationProgress * 2
                : (1.0 - animationProgress) * 2;

        const needle = {
            length: props.radius - outerRing.lineWidth / 2,
            color: "white",
            sheta:
                props.angleFrom +
                easeInOutQuint(needlePosProgress) *
                    (props.angleTo - props.angleFrom),

            lineWidth: this.relMin(0.003),
            margin: {
                color: props.background,
                size: this.relMin(0.00325),
            },
        };

        ////////////////////////////////////

        const width = this.canvas.canvas.width;
        const height = this.canvas.canvas.height;

        const ringLength = props.angleTo - props.angleFrom;

        this.canvas.fillStyle = props.background;
        this.canvas.fillRect(0, 0, width, height);

        this.canvas.textBaseline = "hanging";
        this.canvas.textAlign = "left";
        this.canvas.fillStyle = "white";
        this.canvas.font = "48px serif";
        this.canvas.fillText(_0pad(this.frames, 5), ...this.pos(0, 0));

        this.circle(
            outerRing.color,
            outerRing.lineWidth,
            props.center,
            props.radius,
            props.angleFrom,
            props.angleTo,
        );

        for (
            let sheta =
                props.angleFrom + ringLength / innerRing.piller.count / 2;
            sheta <= props.angleTo;
            sheta += ringLength / innerRing.piller.count
        ) {
            this.piller(
                innerRing.color,
                innerRing.lineWidth,
                props.center,
                innerRing.radius + innerRing.piller.length,
                sheta,
                innerRing.piller.length,
                innerRing.margin.size,
                innerRing.margin.color,
            );
        }

        this.circle(
            innerRing.color,
            innerRing.lineWidth,
            props.center,
            innerRing.radius,
            props.angleFrom,
            props.angleTo,
        );

        for (
            let sheta = props.angleFrom;
            sheta <= props.angleTo;
            sheta += ringLength / (largePiller.count - 1)
        ) {
            this.piller(
                largePiller.color,
                largePiller.lineWidth,
                props.center,
                props.radius,
                sheta,
                largePiller.length,
                largePiller.margin.size,
                largePiller.margin.color,
            );
        }

        for (
            let sheta = props.angleFrom + ringLength / smallPiller.count / 2;
            sheta <= props.angleTo;
            sheta += ringLength / smallPiller.count
        ) {
            this.piller(
                smallPiller.color,
                smallPiller.lineWidth,
                props.center,
                smallPiller.radius,
                sheta,
                smallPiller.length,
                smallPiller.margin.size,
                smallPiller.margin.color,
            );
        }

        for (
            let sheta = props.angleFrom + ringLength / tinyPiller.count / 2;
            sheta <= props.angleTo;
            sheta += ringLength / tinyPiller.count
        ) {
            this.piller(
                tinyPiller.color,
                tinyPiller.lineWidth,
                props.center,
                tinyPiller.radius,
                sheta,
                tinyPiller.length,
                tinyPiller.margin.size,
                tinyPiller.margin.color,
            );
        }

        let index = 0;
        for (
            let sheta = props.angleFrom;
            sheta <= props.angleTo;
            sheta += ringLength / (largePiller.count - 1)
        ) {
            this.canvas.textBaseline = "middle";
            this.canvas.textAlign = "center";
            this.canvas.fillStyle = label.color;
            this.canvas.font = label.font;
            (this.canvas as any).letterSpacing = label.letterSpacing; // experimental feature
            const pos = this.polar(props.center, label.radius, sheta);
            this.canvas.fillText(label.text(index++), ...pos);
        }

        this.text(unitLabel);
        this.text(gearLabel);

        this.piller(
            needle.color,
            needle.lineWidth,
            props.center,
            needle.length,
            needle.sheta,
            needle.length,
            needle.margin.size,
            needle.margin.color,
        );
    }
}

// what a good page.
// https://easings.net/#easeInOutQuint
function easeInOutQuint(x: number): number {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

function _0pad(n: number, len: number): string {
    let output = "";
    for (let i = 0; i < len; i++) {
        output += "0";
    }

    output += `${n}`;
    return output.substring(output.length - len);
}
