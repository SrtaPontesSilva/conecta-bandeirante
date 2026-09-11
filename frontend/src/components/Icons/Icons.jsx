/*
 * ============================================================
 * ÍCONES
 * ------------------------------------------------------------
 * Conjunto de ícones em linha (stroke), minimalistas e
 * geométricos, usados no lugar de emojis na navbar e no
 * rodapé. Todos herdam a cor do texto via `currentColor`.
 * ============================================================
 */

function IconBase({ children, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <line x1="20" y1="20" x2="15.8" y2="15.8" />
    </IconBase>
  );
}

export function IconWallet(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="6.5" width="18" height="12" rx="1.5" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconBell(props) {
  return (
    <IconBase {...props}>
      <path d="M6.5 8.5a5.5 5.5 0 0 1 11 0c0 3.6 1.3 5 1.3 5H5.2s1.3-1.4 1.3-5Z" />
      <path d="M9.8 17.3a2.2 2.2 0 0 0 4.4 0" />
    </IconBase>
  );
}

export function IconMenu(props) {
  return (
    <IconBase {...props}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </IconBase>
  );
}

export function IconUser(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8.2" r="3.4" />
      <path d="M5.2 19.5c0-3.5 3-6 6.8-6s6.8 2.5 6.8 6" />
    </IconBase>
  );
}

export function IconClipboard(props) {
  return (
    <IconBase {...props}>
      <rect x="6" y="4.2" width="12" height="15.8" rx="1.5" />
      <path d="M9 4.2V3.6A1.6 1.6 0 0 1 10.6 2h2.8a1.6 1.6 0 0 1 1.6 1.6v0.6" />
      <line x1="9" y1="10.2" x2="15" y2="10.2" />
      <line x1="9" y1="13.6" x2="15" y2="13.6" />
      <line x1="9" y1="17" x2="12.5" y2="17" />
    </IconBase>
  );
}

export function IconLogout(props) {
  return (
    <IconBase {...props}>
      <path d="M9.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3.5" />
      <line x1="20" y1="12" x2="10.5" y2="12" />
      <polyline points="16 7.5 20.5 12 16 16.5" />
    </IconBase>
  );
}

export function IconTicket(props) {
  return (
    <IconBase {...props}>
      <path d="M4 8.3A1.5 1.5 0 0 1 5.5 6.8h13A1.5 1.5 0 0 1 20 8.3v2a1.7 1.7 0 0 0 0 3.4v2A1.5 1.5 0 0 1 18.5 17.2h-13A1.5 1.5 0 0 1 4 15.7v-2a1.7 1.7 0 0 0 0-3.4v-2Z" />
      <line x1="14.2" y1="7.3" x2="14.2" y2="16.2" strokeDasharray="2.2 2.2" />
    </IconBase>
  );
}

export function IconVideo(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="6.8" width="12.2" height="10.4" rx="1.5" />
      <path d="M15.2 10.4 21 7.3v9.4l-5.8-3.1" />
    </IconBase>
  );
}

export function IconPlus(props) {
  return (
    <IconBase {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </IconBase>
  );
}

export function IconArrowLeft(props) {
  return (
    <IconBase {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="11 6 5 12 11 18" />
    </IconBase>
  );
}

export function IconChevronLeft(props) {
  return (
    <IconBase {...props}>
      <polyline points="14.5 5.5 8.5 12 14.5 18.5" />
    </IconBase>
  );
}

export function IconChevronRight(props) {
  return (
    <IconBase {...props}>
      <polyline points="9.5 5.5 15.5 12 9.5 18.5" />
    </IconBase>
  );
}

export function IconChevronDown(props) {
  return (
    <IconBase {...props}>
      <polyline points="5.5 9.5 12 15.5 18.5 9.5" />
    </IconBase>
  );
}

export function IconMapPin(props) {
  return (
    <IconBase {...props}>
      <path d="M12 21s-6.8-6.1-6.8-11.2a6.8 6.8 0 0 1 13.6 0C18.8 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.7" r="2.2" />
    </IconBase>
  );
}

export function IconCalendar(props) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <line x1="3.5" y1="9.8" x2="20.5" y2="9.8" />
      <line x1="8" y1="3" x2="8" y2="6.8" />
      <line x1="16" y1="3" x2="16" y2="6.8" />
    </IconBase>
  );
}

export function IconGift(props) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="9.5" width="17" height="10.5" rx="1.2" />
      <line x1="12" y1="9.5" x2="12" y2="20" />
      <path d="M3.5 9.5h17" />
      <path d="M12 9.5S9.5 9.5 8.3 8.2A2.2 2.2 0 1 1 12 5.6a2.2 2.2 0 1 1 3.7 2.6C14.5 9.5 12 9.5 12 9.5Z" />
    </IconBase>
  );
}

export function IconRepeat(props) {
  return (
    <IconBase {...props}>
      <path d="M4 12V9.5A2.5 2.5 0 0 1 6.5 7H18" />
      <polyline points="14.5 3.5 18 7 14.5 10.5" />
      <path d="M20 12v2.5a2.5 2.5 0 0 1-2.5 2.5H6" />
      <polyline points="9.5 13.5 6 17 9.5 20.5" />
    </IconBase>
  );
}

export function IconTag(props) {
  return (
    <IconBase {...props}>
      <path d="M20 12.7 12.7 20a1.5 1.5 0 0 1-2.1 0l-6.6-6.6a1.5 1.5 0 0 1 0-2.1L11.3 4h5.2A3.5 3.5 0 0 1 20 7.5v5.2Z" />
      <circle cx="15" cy="9" r="1.4" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconCheck(props) {
  return (
    <IconBase {...props}>
      <polyline points="5 12.5 9.5 17 19 6.5" />
    </IconBase>
  );
}