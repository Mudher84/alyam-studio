export function ProjectSkeleton() {
  return (
    <div className="group animate-pulse bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl p-4">
      <div className="aspect-[4/3] bg-[#EAE2D5] rounded-xl overflow-hidden relative mb-4"></div>
      <div className="h-5 bg-[#EAE2D5] rounded w-3/4 mb-2"></div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E0D7C9]">
        <div className="h-3.5 bg-[#EAE2D5] rounded w-1/3"></div>
        <div className="h-3.5 bg-[#EAE2D5] rounded w-1/5"></div>
      </div>
    </div>
  );
}
