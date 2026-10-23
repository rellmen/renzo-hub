import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import type {ComponentType,ReactNode} from 'react';
const mocks=vi.hoisted(()=>({load:vi.fn(),create:vi.fn(),review:vi.fn(),change:vi.fn()}));
vi.mock('@tanstack/react-router',()=>({
 createFileRoute:()=> (options:unknown)=>({options}),
 Link:({to,children,...props}:{to:string;children:ReactNode})=><a href={to} {...props}>{children}</a>
}));
vi.mock('@/lib/auth/AuthProvider',()=>({useAuth:()=>({user:{id:'22222222-2222-4222-8222-222222222222'},client:{}})}));
vi.mock('@/lib/inbox-records.mjs',async importOriginal=>({...await importOriginal<object>(),loadInbox:mocks.load,createCapture:mocks.create,reviewCapture:mocks.review,changeCaptureStatus:mocks.change}));
import {Route} from '../routes/inbox';
const row={id:'33333333-3333-4333-8333-333333333333',owner_id:'22222222-2222-4222-8222-222222222222',title:'Synthetic note',status:'needs_review',domain:'system',record_type:'renzo_inbox',updated_at:'2026-10-23T12:00:00Z',occurred_at:'2026-10-23T12:00:00Z',payload:{category:'Note',status:'needs_review',note:'Keep the original'}};
function mount(){const Component=Route.options.component as ComponentType;return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})}><Component/></QueryClientProvider>);}
beforeEach(()=>{vi.clearAllMocks();mocks.load.mockResolvedValue([row]);mocks.create.mockResolvedValue(row);mocks.review.mockResolvedValue({ok:true});});
afterEach(cleanup);
describe('Native AI Inbox',()=>{
 it('keeps a captured note and clears the draft only after the server confirms',async()=>{
  mount();await screen.findByText('Synthetic note');
  fireEvent.change(screen.getByLabelText('Título'),{target:{value:'New private note'}});
  fireEvent.click(screen.getByRole('button',{name:'Guardar captura'}));
  await screen.findByText('Captura guardada en tu bandeja.');
  expect(mocks.create.mock.calls[0]![2]).toMatchObject({title:'New private note',category:'Note'});
  expect(mocks.create.mock.calls[0]![2].id).toMatch(/^[0-9a-f-]{36}$/);
  expect(screen.getByLabelText('Título')).toHaveValue('');
 });
 it('requires explicit confirmation and surfaces conflicts without claiming the review was saved',async()=>{
  mocks.review.mockRejectedValue(Error('Cambió en otro dispositivo. Actualiza.'));
  mount();fireEvent.click(await screen.findByRole('button',{name:'Marcar revisada'}));
  expect(mocks.review).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Confirmar revisión'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Cambió en otro dispositivo');
  expect(screen.queryByText('Cambio guardado y confirmado.')).not.toBeInTheDocument();
 });
 it('routes payroll to its dedicated importer and confirms receipt amounts without adding bank movements',async()=>{
  mocks.load.mockResolvedValue([{...row,id:'payroll',title:'Synthetic payroll',payload:{category:'payslip',status:'needs_review'}},
   {...row,id:'receipt',title:'Synthetic fuel receipt',payload:{category:'receipt',status:'needs_review',source:'jarvis',date:'2026-10-23',extracted:{amount:50,currency:'EUR'}}}]);
  mount();expect(await screen.findByRole('link',{name:'Revisar en Nóminas'})).toHaveAttribute('href','/nominas');
  fireEvent.click(screen.getByRole('button',{name:'Confirmar documento de gasto'}));
  expect(screen.getByText(/Importe detectado: 50 EUR/)).toBeInTheDocument();
  expect(mocks.review).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Confirmar revisión'}));
  await waitFor(()=>expect(mocks.review).toHaveBeenCalledTimes(1));
 });
});
