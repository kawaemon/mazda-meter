import { useEffect, useRef } from 'react'
import { main } from '../lib/main';
import styles from '../styles/Home.module.css'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current == null) {
      return;
    }

    main(canvasRef.current);
  }, [canvasRef]);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
