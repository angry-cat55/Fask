const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const { loginId, password } = req.body || {};

  if (!loginId || !password) {
    return res.status(400).json({ success: false, message: 'loginId and password required' });
  }

  console.log('Received login:', { loginId, password: password ? '[REDACTED]' : '' });

  return res.json({ success: true, message: '테스트 데이터가 들어와서, 테스트 닉네임을 전송합니다.', data: { 
    nickname: "테스트 유저"
 } });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
})