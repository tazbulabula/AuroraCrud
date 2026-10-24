import { ArrowRight, Banknote, MapPin, PackageCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';

const PublicFooter = () => (
  <footer id="contato" className="mt-16 bg-stone-950 text-stone-300">
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <BrandMark className="h-10 w-10 rounded-2xl bg-amber-400 text-stone-950" />
            <span className="text-lg font-extrabold tracking-tight text-white">
              Mercado <span className="text-amber-300">Aurora</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-stone-400">
            Produtos de vendedores locais, com uma experiência simples e próxima de quem compra em Angola.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-stone-400">
            <MapPin aria-hidden="true" className="h-4 w-4 text-amber-300" />
            Feito para Angola · Preços em Kwanza
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link to="/" className="transition hover:text-amber-300">Ver produtos</Link></li>
            <li><Link to="/track" className="transition hover:text-amber-300">Rastrear encomenda</Link></li>
            <li><Link to="/register" className="transition hover:text-amber-300">Criar conta</Link></li>
            <li><Link to="/login" className="transition hover:text-amber-300">Entrar na conta</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Uma compra com confiança</h2>
          <ul className="mt-4 space-y-4 text-sm text-stone-300">
            <li className="flex items-start gap-3">
              <PackageCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span>Consulte o estado da encomenda a qualquer momento.</span>
            </li>
            <li className="flex items-start gap-3">
              <Banknote aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span>Pagamento combinado com o vendedor na entrega.</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span>Encomendas acompanhadas com código de rastreio.</span>
            </li>
          </ul>
          <a href="#catalogo" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-300 transition hover:text-amber-200">
            Descobrir produtos <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Mercado Aurora. Todos os direitos reservados.</p>
        <p>Um mercado local, feito para aproximar pessoas.</p>
      </div>
    </div>
  </footer>
);

export default PublicFooter;
