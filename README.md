# 🎮 Radio Mirchi

A narrative-driven, pixel-styled browser game where players act as underground agents infiltrating retro-style radio broadcasts filled with AI-generated propaganda. Using a vintage terminal interface, players must strategically persuade listeners to question the narrative before being discovered.

## 🎯 Game Objective

**Win Condition**: Convince 80% of radio listeners to start questioning the propaganda

**Lose Conditions**:
- Get muted by the host
- Disconnected by AI security system
- Time runs out

## 🛠️ Technical Architecture

### Frontend Stack
- **Framework**: React 18+
- **Styling**: TailwindCSS
- **Window Management**: react-rnd 
- **State Management**: zustand (lightweight) or Redux Toolkit
- **Audio**: Web Audio API + Web Speech API
- **Fonts**: Press Start 2P, VT323

### Backend Stack
- **API**: FastAPI (Python) or Express.js (Node.js)
- **LLM**: OpenAI GPT-4 or Anthropic Claude
- **TTS**: ElevenLabs API or Azure Speech Services
- **STT**: OpenAI Whisper API
- **Database**: PostgreSQL (via Supabase) or MongoDB

### Deployment
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or Google Cloud Run
- **Database**: Supabase or PlanetScale

## 🎯 Success Metrics

### MVP 1
- [x] Terminal opens and accepts commands
- [x] Basic frequency scanning works
- [x] Retro UI aesthetic achieved

### MVP 2
- [ ] AI host responds coherently
- [ ] Persuasion meter changes based on input
- [ ] Win/lose conditions trigger correctly

### MVP 3
- [ ] Voice input/output works smoothly
- [ ] Multiple AI personalities feel distinct
- [ ] Security system creates engaging tension

### MVP 4
- [ ] All windows function independently
- [ ] Full desktop simulation experience
- [ ] Game state persists between sessions

### MVP 5
- [ ] Game feels polished and complete
- [ ] Tutorial successfully onboards new players
- [ ] Achievement system encourages replay

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
