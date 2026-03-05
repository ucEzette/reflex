import ClientPage from './EvidenceClient';

export default function EvidenceServerPage({ params }: { params: { id: string } }) {
    return <ClientPage params={params} />;
}
