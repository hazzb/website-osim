import React from "react";

// 1. BASE SKELETON
export const Skeleton = ({
  width = "100%",
  height = "20px",
  borderRadius = "12px",
  className = "",
}) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
};

// 2. PROGJA SKELETON CARD
export const ProgjaSkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl border border-border-dim h-[200px] p-6 flex flex-col gap-4">
      <Skeleton width="70%" height="24px" />
      <Skeleton width="40%" height="16px" />
      <div className="mt-auto">
        <Skeleton width="100%" height="30px" borderRadius="8px" />
      </div>
    </div>
  );
};

// 3. PROGJA SKELETON GRID
export const ProgjaSkeletonGrid = () => {
  return (
    <div className="mt-8">
      <div className="mb-8">
        <Skeleton
          width="200px"
          height="32px"
          borderRadius="8px"
          className="mb-4"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProgjaSkeletonCard />
          <ProgjaSkeletonCard />
          <ProgjaSkeletonCard />
        </div>
      </div>
      <div>
        <Skeleton
          width="200px"
          height="32px"
          borderRadius="8px"
          className="mb-4"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <ProgjaSkeletonCard />
          <ProgjaSkeletonCard />
        </div>
      </div>
    </div>
  );
};

// 4. ANGGOTA SKELETON CARD
export const AnggotaSkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-border-dim p-6 flex flex-col items-center gap-4 h-[280px]">
      <Skeleton width="100px" height="100px" borderRadius="50%" />
      <div className="w-full flex flex-col items-center gap-2">
        <Skeleton width="80%" height="24px" />
        <Skeleton width="50%" height="16px" />
      </div>
      <div className="mt-auto w-full flex justify-center">
        <Skeleton width="40%" height="20px" />
      </div>
    </div>
  );
};

// 5. ANGGOTA SKELETON GRID
export const AnggotaSkeletonGrid = () => {
  return (
    <div className="mt-8 flex flex-col gap-16">
      {[1, 2].map((i) => (
        <div key={i}>
          <div className="flex items-center gap-4 mb-6 pb-2 border-b-2 border-slate-100">
            <Skeleton width="40px" height="40px" borderRadius="8px" />
            <Skeleton width="200px" height="32px" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnggotaSkeletonCard />
            <AnggotaSkeletonCard />
            <AnggotaSkeletonCard />
          </div>
        </div>
      ))}
    </div>
  );
};

// 6. HERO SKELETON
export const HeroSkeleton = () => {
  return (
    <div className="w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden relative mb-8">
      <Skeleton width="100%" height="100%" borderRadius="0" />
      <div className="absolute bottom-10 left-10 w-1/2">
        <Skeleton width="70%" height="40px" className="mb-4" />
        <Skeleton width="90%" height="20px" />
      </div>
    </div>
  );
};

// 7. VISI MISI SKELETON
export const VisiMisiSkeleton = () => {
  return (
    <div className="w-full py-8">
      <div className="flex flex-col items-center mb-16 text-center">
        <Skeleton width="200px" height="40px" className="mb-4" />
        <Skeleton width="60%" height="20px" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="p-8 border border-border-dim rounded-2xl bg-white"
          >
            <Skeleton width="40%" height="30px" className="mb-6" />
            <div className="flex flex-col gap-3">
              <Skeleton width="100%" height="16px" />
              <Skeleton width="90%" height="16px" />
              <Skeleton width="95%" height="16px" />
              <Skeleton width="60%" height="16px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
