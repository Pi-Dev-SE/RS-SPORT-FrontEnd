import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { HttpClient } from '@angular/common/http';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-recovery-calendar',
  templateUrl: './recovery-calendar.component.html',
  styleUrls: ['./recovery-calendar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RecoveryCalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: [],
    contentHeight: 'auto',
    aspectRatio: 1.2,
    dayMaxEventRows: 3,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    dayHeaderFormat: { weekday: 'short' },
    dayCellContent: (e) => e.dayNumberText.replace('日', ''),

    eventContent: (arg) => {
      const title = arg.event.title;
      const status = arg.event.extendedProps['status'];
      const daysRemaining = arg.event.extendedProps['daysRemaining'];

      // HTML à afficher dans la case de l'événement
      return {
        html: `
          <div style="font-size: 0.75em; line-height: 1.2;">
            <strong>${title}</strong><br>
            <span>🕓 ${daysRemaining} j</span><br>
            <span>📌 ${status}</span>
          </div>
        `
      };
    },

    eventDidMount: (info) => {
      const statusColors = {
        'COMPLETED': '#28a745',
        'PAUSED': '#17a2b8',
        'ACTIVE': '#ffc107'
      };
      const status = info.event.extendedProps['status'] as keyof typeof statusColors;

      if (status && statusColors[status]) {
        info.el.style.backgroundColor = statusColors[status];
      }

      info.el.style.padding = '2px 4px';
      info.el.style.fontSize = '0.8em';
      info.el.style.margin = '1px 0';
      info.el.style.borderRadius = '3px';
      info.el.style.color = '#fff';

      // Tooltip avec infos supplémentaires
      const daysRemaining = info.event.extendedProps['daysRemaining'];
      const recoveryDate = info.event.extendedProps['recoveryDate'];
      info.el.title = `${info.event.title}\nJours restants: ${daysRemaining}\nDate de récupération: ${recoveryDate}`;
    }
  };


  loading = true;
  error = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchEvents();
  }

  fetchEvents() {
    this.loading = true;
    this.error = false;

    this.http.get<any[]>('http://localhost:8089/spr01/RecoveryRegime/events')
      .subscribe({
        next: (data) => {
          try {
            const events: EventInput[] = data.map(event => {
              // Vérification et formatage de la date
              let startDate;
              try {
                startDate = event.date ? new Date(event.date).toISOString() : new Date().toISOString();
              } catch (e) {
                console.warn('Date invalide pour l\'événement:', event.date);
                startDate = new Date().toISOString();
              }

              return {
                title: event.title || 'Régime de récupération',
                start: startDate,
                allDay: true,
                extendedProps: {
                  status: event.status || 'SCHEDULED',
                  recoveryDate: event.recoveryDate || 'Non spécifiée',
                  daysRemaining: event.daysRemaining ?? 0
                }
              };
            });

            // Mise à jour réactive du calendrier
            this.calendarOptions = {
              ...this.calendarOptions,
              events: events
            };

            console.log('Événements chargés:', events);
          } catch (error) {
            console.error('Erreur de traitement des événements:', error);
            this.error = true;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur de récupération des événements:', err);
          this.error = true;
          this.loading = false;
        }
      });
  }

  // Optionnel: Rafraîchir les événements
  refreshEvents() {
    this.fetchEvents();
  }
}
