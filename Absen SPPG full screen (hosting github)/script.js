const form = document.getElementById("absenForm");
const statusEl = document.getElementById("status");

const kantorLat = -5.17690548567987;
const kantorLng = 119.47574517300167;
const radiusMaks = 200; // 200 meter

function hitungJarak(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = x => x * Math.PI / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

form.addEventListener("submit", e => {
  e.preventDefault();
  statusEl.textContent = "Mendapatkan lokasi...";

  if (!navigator.geolocation) {
    statusEl.textContent = "❌ Browser tidak mendukung geolocation.";
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const jarak = hitungJarak(lat, lng, kantorLat, kantorLng);

    if (jarak > radiusMaks) {
      statusEl.textContent = "❌ Anda berada di luar radius 200 meter. Absensi ditolak.";
      return;
    }

    const data = {
      nama: form.nama.value.trim(),
      bagian: form.bagian.value,
      lat, lng, jarak
    };

    fetch("https://script.google.com/macros/s/AKfycbxwXfvmVcEinJcISoGVqMiBCZHgQ-IV9npVWyXuFGUoEMleZfiqkRsTXLZ0YBtLLjCB/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(res => res.text())
    .then(() => {
      statusEl.textContent = "✅ Absensi berhasil dikirim!";
      form.reset();
    })
    .catch(err => {
      statusEl.textContent = "❌ Gagal mengirim absensi.";
      console.error(err);
    });
  }, err => {
    statusEl.textContent = "❌ Tidak bisa mendapatkan lokasi (" + err.message + ")";
  }, { timeout: 10000 });
});
