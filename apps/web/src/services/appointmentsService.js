import pocketbaseClient from '@/lib/pocketbaseClient';

const COLLECTION = 'appointments';

export const SERVICES = [
    'Consultoria',
    'Atendimento Técnico',
    'Suporte',
    'Reunião',
    'Instalação',
    'Manutenção',
    'Avaliação',
    'Atendimento Presencial',
    'Atendimento Online',
];

export const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00',
];

export const STATUS_LABELS = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
};

export async function getAppointmentsByDate(date) {
    return pocketbaseClient.collection(COLLECTION).getFullList({
        filter: `date = "${date}"`,
        sort: 'time',
    });
}

export async function getBookedTimes(date) {
    const list = await pocketbaseClient.collection(COLLECTION).getFullList({
        filter: `date = "${date}" && status != "cancelado"`,
    });
    return list.map((a) => a.time);
}

export async function createAppointment(data) {
    return pocketbaseClient.collection(COLLECTION).create({
        ...data,
        status: 'agendado',
    });
}

export async function getAllAppointments(filterDate) {
    const options = { sort: '-date,time' };
    if (filterDate) options.filter = `date = "${filterDate}"`;
    return pocketbaseClient.collection(COLLECTION).getFullList(options);
}

export async function updateStatus(id, status) {
    return pocketbaseClient.collection(COLLECTION).update(id, { status });
}

export async function deleteAppointment(id) {
    return pocketbaseClient.collection(COLLECTION).delete(id);
}

export async function adminLogin(email, password) {
    return pocketbaseClient.collection('users').authWithPassword(email, password);
}

export function adminLogout() {
    pocketbaseClient.authStore.clear();
}

export function isAdminAuthed() {
    return pocketbaseClient.authStore.isValid;
}

export function currentAdmin() {
    return pocketbaseClient.authStore.record;
}
