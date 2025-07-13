const TTS_SAMPLE_RATE = 24000;

class AudioPlayer {
  private audioContext: AudioContext;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private sourceNode: AudioBufferSourceNode | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: TTS_SAMPLE_RATE,
    });
  }

  public addAudioChunk(chunk: ArrayBuffer) {
    this.audioQueue.push(chunk);
    if (!this.isPlaying) {
      this.playNextChunk();
    }
  }

  private _createWavFile(pcmData: ArrayBuffer): ArrayBuffer {
    const pcmDataLength = pcmData.byteLength;
    const sampleRate = this.audioContext.sampleRate;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF identifier
    view.setUint8(0, 'R'.charCodeAt(0));
    view.setUint8(1, 'I'.charCodeAt(0));
    view.setUint8(2, 'F'.charCodeAt(0));
    view.setUint8(3, 'F'.charCodeAt(0));
    // RIFF chunk size
    view.setUint32(4, 36 + pcmDataLength, true);
    // WAVE identifier
    view.setUint8(8, 'W'.charCodeAt(0));
    view.setUint8(9, 'A'.charCodeAt(0));
    view.setUint8(10, 'V'.charCodeAt(0));
    view.setUint8(11, 'E'.charCodeAt(0));
    // fmt sub-chunk identifier
    view.setUint8(12, 'f'.charCodeAt(0));
    view.setUint8(13, 'm'.charCodeAt(0));
    view.setUint8(14, 't'.charCodeAt(0));
    view.setUint8(15, ' '.charCodeAt(0));
    // fmt chunk size
    view.setUint32(16, 16, true);
    // Audio format (PCM)
    view.setUint16(20, 1, true);
    // Number of channels
    view.setUint16(22, numChannels, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate
    view.setUint32(28, byteRate, true);
    // Block align
    view.setUint16(32, blockAlign, true);
    // Bits per sample
    view.setUint16(34, bitsPerSample, true);
    // data sub-chunk identifier
    view.setUint8(36, 'd'.charCodeAt(0));
    view.setUint8(37, 'a'.charCodeAt(0));
    view.setUint8(38, 't'.charCodeAt(0));
    view.setUint8(39, 'a'.charCodeAt(0));
    // data chunk size
    view.setUint32(40, pcmDataLength, true);

    const wavBytes = new Uint8Array(wavHeader.byteLength + pcmData.byteLength);
    wavBytes.set(new Uint8Array(wavHeader), 0);
    wavBytes.set(new Uint8Array(pcmData), wavHeader.byteLength);

    return wavBytes.buffer;
  }

  private async playNextChunk() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const chunk = this.audioQueue.shift();

    if (chunk) {
      try {
        const wavData = this._createWavFile(chunk);
        const audioBuffer = await this.audioContext.decodeAudioData(wavData);
        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = audioBuffer;
        this.sourceNode.connect(this.audioContext.destination);
        this.sourceNode.onended = () => {
          this.playNextChunk();
        };
        this.sourceNode.start();
      } catch (error) {
        console.error('Error decoding or playing audio data:', error);
        this.playNextChunk(); // Continue with the next chunk
      }
    }
  }

  public isQueueEmpty(): boolean {
    return this.audioQueue.length === 0 && !this.isPlaying;
  }

  public stop() {
    if (this.sourceNode) {
      this.sourceNode.onended = null; // Prevent onended from firing
      this.sourceNode.stop();
      this.sourceNode = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
  }
}

export default AudioPlayer;