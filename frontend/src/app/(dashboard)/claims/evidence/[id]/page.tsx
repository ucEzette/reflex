import ClientPage from './client';

export default function EvidenceServerPage({ params }: { params: { id: string } }) {
    return <ClientPage params={params} />;
}
