# Admin-Godkänd Registrering - Användarguide

## Översikt

CDLP Linesheet Generator använder nu admin-godkänd registrering istället för email-verifiering. Detta ger högre säkerhet och bättre kontroll över vem som får tillgång till systemet.

## För Användare

### Registreringsprocess

1. **Registrera dig**
   - Gå till registreringssidan
   - Använd endast din `@cdlp.com` email-adress
   - Skapa ett starkt lösenord
   - Klicka "Create Account"

2. **Vänta på godkännande**
   - Ditt konto skapas men är inaktivt
   - Du får ett meddelande: "Registration successful! Your account is pending admin approval"
   - Admin får automatiskt en notifikation om din registrering

3. **Efter godkännande**
   - Du får ett email när admin godkänt ditt konto
   - Du kan logga in och börja använda systemet
   - Du måste fortfarande sätta upp MFA (Two-Factor Authentication)

### Inloggning

- **Under väntan**: Du kan inte logga in förrän admin godkänt ditt konto
- **Efter godkännande**: Normal inloggning med email/lösenord + MFA

## För Administratörer

### Hantera Registreringar

1. **Kom åt Admin Panel**
   - Logga in med admin-konto
   - Gå till `/admin/users`
   - Se "Pending Approvals" sektion

2. **Godkänn Användare**
   - Klicka "Approve" för att godkänna
   - Användaren får automatiskt ett email
   - Kontot aktiveras omedelbart

3. **Avslå Användare**
   - Klicka "Reject" för att avslå
   - Bekräfta avslag
   - Användaren får ett email med avslag
   - Kontot raderas permanent

### Admin Notifikationer

- **Email-notifikationer** skickas automatiskt när nya användare registrerar sig
- **Innehåller**: Användarens email, User ID, registreringstid
- **Länk**: Direkt till admin panel för snabb hantering

### Säkerhetsfunktioner

- **Fullständig kontroll**: Endast admin kan godkänna nya användare
- **Audit logging**: Alla godkännande/avslag loggas
- **Email-bekräftelse**: Användare får bekräftelse på godkännande/avslag
- **Automatisk rensning**: Avslagna konton raderas automatiskt

## Fördelar med Admin-Godkänd Registrering

### Säkerhet
- ✅ **Ingen email-verifiering** behövs
- ✅ **Fullständig kontroll** över vem som får tillgång
- ✅ **Automatisk spam-skydd**
- ✅ **Audit trail** för alla registreringar

### Användarvänlighet
- ✅ **Enklare process** för användare
- ✅ **Inga email-problem** eller borttappade länkar
- ✅ **Snabbare onboarding** efter godkännande
- ✅ **Tydlig status** på registrering

### Administrativ kontroll
- ✅ **Centraliserad hantering** av alla registreringar
- ✅ **Email-notifikationer** för nya registreringar
- ✅ **Enkel godkännande/avslag** process
- ✅ **Fullständig transparens** i processen

## Miljövariabler

Lägg till denna variabel i Vercel:

```bash
ADMIN_EMAIL=admin@cdlp.com
```

Detta är email-adressen som får notifikationer om nya registreringar.

## Workflow

### Användarregistrering
1. Användare registrerar sig → Konto skapas (inaktivt)
2. Admin får email-notifikation
3. Admin granskar och godkänner/avslår
4. Användare får bekräftelse via email
5. Vid godkännande: Användare kan logga in och sätta upp MFA

### Admin-hantering
1. Admin loggar in → Går till `/admin/users`
2. Ser "Pending Approvals" sektion
3. Klickar "Approve" eller "Reject"
4. System skickar automatiskt email till användaren
5. Audit log uppdateras

## Felsökning

### Användare kan inte logga in
- **Kontrollera**: Är kontot godkänt av admin?
- **Lösning**: Kontakta admin för godkännande

### Admin får inga notifikationer
- **Kontrollera**: Är `ADMIN_EMAIL` satt korrekt i Vercel?
- **Kontrollera**: Fungerar email-konfiguration (SendGrid)?

### Registrering misslyckas
- **Kontrollera**: Använder du `@cdlp.com` email?
- **Kontrollera**: Uppfyller lösenordet kraven?

## Support

För frågor eller problem:
- **Tekniska problem**: Kontakta systemadministratör
- **Registreringsproblem**: Kontakta admin@cdlp.com
- **Säkerhetsfrågor**: Kontakta security@cdlp.com

---

**Implementerat**: December 2024  
**Version**: 1.0  
**För Support**: Kontakta din systemadministratör
