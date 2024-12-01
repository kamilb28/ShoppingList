### Backend:
**komenty nalezy uruchomic z wlasciwego im katalogu**

stworzenie wirtualnego środowiska: `python3 -m venv venv`, `source venv/bin/activate`

instalacja zależności: `pip install -r req.txt`

uruchomienie fast api: `uvicorn main:app --reload`

---

testy (wszystkie): `pytest -v`

jednostkowe: `pytest -v test/unit`

integracyjne: `pytest -v test/integration`

systemowe (end-to-end): `pytest -v test/e2e`

### Angular:
**komenty nalezy uruchomic z wlasciwego im katalogu**

instalacja zależności: `npm install`

uruchomienie frontu: `ng serve`

---

testy (wszystkie): `npm test`

jednostkowe: `npm test -- test/unit-tests`
