import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';

export default function QrCard({ clinicId, clinicName }) {
  const ref = useRef(null);
  const url = `${window.location.origin}/queue/${clinicId}`;

  const download = () => {
    const canvas = ref.current.querySelector('canvas');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${clinicName}-qlinic-qr.png`;
    a.click();
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-md shadow-violet-100 text-center">
      <p className="flex items-center justify-center gap-2 font-bold">
        <QrCode size={18} className="text-violet-500" /> Clinic QR code
      </p>
      <p className="text-xs text-slate-500 mt-1">Print it and stick it outside your clinic</p>
      <div ref={ref} className="inline-block mt-4 p-3 rounded-2xl" style={{ background: '#ffffff' }}>
        <QRCodeCanvas value={url} size={150} bgColor="#ffffff" fgColor="#6d28d9" level="M" />
      </div>
      <button onClick={download}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition">
        <Download size={16} /> Download QR
      </button>
    </div>
  );
}