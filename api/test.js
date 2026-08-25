export default function handler(req, res) {
  res.status(200).json({ 
    message: "Vercel API is working correctly!",
    env: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
}
