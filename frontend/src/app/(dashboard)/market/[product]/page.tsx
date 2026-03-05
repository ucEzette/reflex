import ClientPage from './client';

export default function ProductServerPage({ params }: { params: { product: string } }) {
    return <ClientPage params={params} />;
}
